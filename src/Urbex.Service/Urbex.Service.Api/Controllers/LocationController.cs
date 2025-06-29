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

    [HttpPost("random")]
    public async Task<IActionResult> GetRandomLocation([FromBody] FilterRequest filters)
    {
        var filterLines = BuildOverpassQuery(filters);
        var query = $"""
                     [out:json][timeout:60];
                     (
                       {filterLines}
                     );
                     out body;
                     """;

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

        var googleMapsUrl =
            $"https://www.google.com/maps?q={lat.Value.ToString(CultureInfo.InvariantCulture)},{lon.Value.ToString(CultureInfo.InvariantCulture)}";

        return Ok(new { url = googleMapsUrl });
    }

    private static string BuildOverpassQuery(FilterRequest f)
    {
        const double lat = 51.56;
        const double lon = 5.09;

        var query = new List<string>();

        string Q(string key, string value) =>
            $"""node(around:{f.RadiusMeters}, {lat.ToString(CultureInfo.InvariantCulture)}, {lon.ToString(CultureInfo.InvariantCulture)})["{key}"="{value}"];""";

        // Historic
        if (f.Ruins) query.Add(Q("historic", "ruins"));
        if (f.Castle) query.Add(Q("historic", "castle"));
        if (f.ArchaeologicalSite) query.Add(Q("historic", "archaeological_site"));
        if (f.Fort) query.Add(Q("historic", "fort"));

        // Abandoned
        if (f.Abandoned) query.Add(Q("abandoned", "yes"));

        // Natural
        if (f.CaveEntrance) query.Add(Q("natural", "cave_entrance"));
        if (f.Spring) query.Add(Q("natural", "spring"));
        if (f.Rock) query.Add(Q("natural", "rock"));
        if (f.Cliff) query.Add(Q("natural", "cliff"));
        if (f.Sinkhole) query.Add(Q("natural", "sinkhole"));
        if (f.Wood) query.Add(Q("natural", "wood"));

        // Landuse
        if (f.Forest) query.Add(Q("landuse", "forest"));

        // Tourism
        if (f.Viewpoint) query.Add(Q("tourism", "viewpoint"));
        if (f.WildernessHut) query.Add(Q("tourism", "wilderness_hut"));
        if (f.AlpineHut) query.Add(Q("tourism", "alpine_hut"));

        // Man made
        if (f.Bunker) query.Add(Q("man_made", "bunker"));
        if (f.Tower) query.Add($"""node(around:{f.RadiusMeters}, {lat.ToString(CultureInfo.InvariantCulture)}, {lon.ToString(CultureInfo.InvariantCulture)})["man_made"="tower"]["tower:type"="observation"];""");

        // Leisure
        if (f.PicnicSite) query.Add(Q("leisure", "picnic_site"));

        // Highway
        if (f.Trailhead) query.Add(Q("highway", "trailhead"));
        if (f.Path) query.Add($"""node(around:{f.RadiusMeters}, {lat.ToString(CultureInfo.InvariantCulture)}, {lon.ToString(CultureInfo.InvariantCulture)})["highway"="path"]["sac_scale"="demanding_mountain_hiking"];""");

        return string.Join('\n', query);
    }


    public class FilterRequest
    {
        public int RadiusMeters { get; set; } = 50000; // default to 50 km

        // Historic
        public bool Ruins { get; set; }
        public bool Castle { get; set; }
        public bool ArchaeologicalSite { get; set; }
        public bool Fort { get; set; }

        // Abandoned
        public bool Abandoned { get; set; }

        // Natural
        public bool CaveEntrance { get; set; }
        public bool Spring { get; set; }
        public bool Rock { get; set; }
        public bool Cliff { get; set; }
        public bool Sinkhole { get; set; }
        public bool Wood { get; set; }

        // Landuse
        public bool Forest { get; set; }

        // Tourism
        public bool Viewpoint { get; set; }
        public bool WildernessHut { get; set; }
        public bool AlpineHut { get; set; }

        // Man made
        public bool Bunker { get; set; }
        public bool Tower { get; set; }

        // Leisure
        public bool PicnicSite { get; set; }

        // Highway
        public bool Trailhead { get; set; }
        public bool Path { get; set; }
    }
}