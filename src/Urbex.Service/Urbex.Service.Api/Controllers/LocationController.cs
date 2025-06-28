using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Nodes;

namespace Urbex.Service.Api.Controllers;

[ApiController]
[Route("api/location")]
public class LocationController : ControllerBase
{
    private static readonly HttpClient HttpClient = new();

    [HttpGet]
    [Route("random")]
    public async Task<IActionResult> GetRandomLocation()
    {
        const string overpassUrl = "https://overpass-api.de/api/interpreter";

        var query = """
                    [out:json][timeout:60];
                    (
                      node["historic"="ruins"](51.1095,4.3669,52.0105,5.8131);
                      node["historic"="castle"](51.1095,4.3669,52.0105,5.8131);
                      node["historic"="archaeological_site"](51.1095,4.3669,52.0105,5.8131);
                      node["historic"="fort"](51.1095,4.3669,52.0105,5.8131);
                      node["abandoned"="yes"](51.1095,4.3669,52.0105,5.8131);
                      node["natural"="cave_entrance"](51.1095,4.3669,52.0105,5.8131);
                      node["natural"="spring"](51.1095,4.3669,52.0105,5.8131);
                      node["natural"="rock"](51.1095,4.3669,52.0105,5.8131);
                      node["natural"="cliff"](51.1095,4.3669,52.0105,5.8131);
                      node["natural"="sinkhole"](51.1095,4.3669,52.0105,5.8131);
                      node["natural"="wood"](51.1095,4.3669,52.0105,5.8131);
                      node["landuse"="forest"](51.1095,4.3669,52.0105,5.8131);
                      node["tourism"="viewpoint"](51.1095,4.3669,52.0105,5.8131);
                      node["man_made"="bunker"](51.1095,4.3669,52.0105,5.8131);
                      node["man_made"="tower"]["tower:type"="observation"](51.1095,4.3669,52.0105,5.8131);
                      node["tourism"="wilderness_hut"](51.1095,4.3669,52.0105,5.8131);
                      node["tourism"="alpine_hut"](51.1095,4.3669,52.0105,5.8131);
                      node["leisure"="picnic_site"](51.1095,4.3669,52.0105,5.8131);
                      node["highway"="trailhead"](51.1095,4.3669,52.0105,5.8131);
                      node["highway"="path"]["sac_scale"="demanding_mountain_hiking"](51.1095,4.3669,52.0105,5.8131);
                    );
                    out body;
                    """;

        var response = await HttpClient.PostAsync(overpassUrl, new StringContent(query));
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

        var googleMapsUrl =
            $"https://www.google.com/maps?q={lat.Value.ToString(CultureInfo.InvariantCulture)},{lon.Value.ToString(CultureInfo.InvariantCulture)}";

        return Ok(new { url = googleMapsUrl });
    }
}