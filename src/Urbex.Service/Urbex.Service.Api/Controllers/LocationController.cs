using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

namespace Urbex.Service.Api.Controllers;

[ApiController]
[Route("api/location")]
public class LocationController : ControllerBase
{
    private static readonly HttpClient HttpClient = new();

    private const string OverpassUrl = "https://overpass-api.de/api/interpreter";
    private const string BoundingBox = "(51.1095,4.3669,52.0105,5.8131)";

    public record LocationRequest(Dictionary<string, string[]>? Filters);

    [HttpPost("random")]
    public async Task<IActionResult> PostRandomLocation([FromBody] LocationRequest request)
    {
        var filterLines = BuildOverpassQuery(request.Filters);
        var query = $"""
                     [out:json][timeout:60];
                     (
                       {filterLines}
                     );
                     out body;
                     """;
        Console.WriteLine("Generated Overpass Query:\n" + query); // Debug output
        var response = await HttpClient.PostAsync(OverpassUrl, new StringContent(query));
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, "Overpass API error");

        var json = await response.Content.ReadFromJsonAsync<JsonObject>();
        var elements = json?["elements"]?.AsArray();
        if (elements == null || elements.Count == 0)
            return NotFound("No locations found");

        var random = new Random();
        var selected = elements[random.Next(elements.Count)];

        var lat = selected["lat"]?.GetValue<double>();
        var lon = selected["lon"]?.GetValue<double>();

        if (lat == null || lon == null)
            return BadRequest("Invalid location data");

        var googleMapsUrl = $"https://www.google.com/maps?q={lat.Value.ToString(CultureInfo.InvariantCulture)},{lon.Value.ToString(CultureInfo.InvariantCulture)}";
        return Ok(new { url = googleMapsUrl });
    }

    private static string BuildOverpassQuery(Dictionary<string, string[]>? filters)
    {
        if (filters == null || filters.Count == 0)
        {
            return string.Join(Environment.NewLine, DefaultFilters.Select(f => $"node{f}{BoundingBox};"));
        }

        var lines = new List<string>();

        foreach (var (key, values) in filters)
        {
            foreach (var value in values)
            {
                if (key == "man_made" && value == "tower")
                {
                    lines.Add($"node[\"man_made\"=\"tower\"][\"tower:type\"=\"observation\"]{BoundingBox};");
                }
                else if (key == "highway" && value == "path")
                {
                    lines.Add($"node[\"highway\"=\"path\"][\"sac_scale\"=\"demanding_mountain_hiking\"]{BoundingBox};");
                }
                else
                {
                    lines.Add($"node[\"{key}\"=\"{value}\"]{BoundingBox};");
                }
            }
        }

        return string.Join(Environment.NewLine, lines);
    }

    private static readonly string[] DefaultFilters =
    [
        "[\"historic\"=\"ruins\"]",
        "[\"historic\"=\"castle\"]",
        "[\"historic\"=\"archaeological_site\"]",
        "[\"historic\"=\"fort\"]",
        "[\"abandoned\"=\"yes\"]",
        "[\"natural\"=\"cave_entrance\"]",
        "[\"natural\"=\"spring\"]",
        "[\"natural\"=\"rock\"]",
        "[\"natural\"=\"cliff\"]",
        "[\"natural\"=\"sinkhole\"]",
        "[\"natural\"=\"wood\"]",
        "[\"landuse\"=\"forest\"]",
        "[\"tourism\"=\"viewpoint\"]",
        "[\"man_made\"=\"bunker\"]",
        "[\"man_made\"=\"tower\"][\"tower:type\"=\"observation\"]",
        "[\"tourism\"=\"wilderness_hut\"]",
        "[\"tourism\"=\"alpine_hut\"]",
        "[\"leisure\"=\"picnic_site\"]",
        "[\"highway\"=\"trailhead\"]",
        "[\"highway\"=\"path\"][\"sac_scale\"=\"demanding_mountain_hiking\"]"
    ];
}
