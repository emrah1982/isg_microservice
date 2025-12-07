using System.ServiceModel.Syndication;
using System.Xml;
using LegislationService.Data;
using LegislationService.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegislationService.Services
{
    public class RssWatcherService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<RssWatcherService> _logger;
        private readonly LegislationDbContext _db;

        public RssWatcherService(IHttpClientFactory httpClientFactory, ILogger<RssWatcherService> logger, LegislationDbContext db)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
            _db = db;
        }

        // Resmî Gazete RSS feed: https://www.resmigazete.gov.tr/rss
        private const string OfficialGazetteRss = "https://www.resmigazete.gov.tr/rss";

        public async Task CheckOfficialGazetteRssAndIngest()
        {
            try
            {
                using var reader = XmlReader.Create(OfficialGazetteRss);
                var feed = SyndicationFeed.Load(reader);
                if (feed == null) return;

                foreach (var item in feed.Items.Take(50))
                {
                    var title = item.Title?.Text?.Trim();
                    var link = item.Links.FirstOrDefault()?.Uri.ToString();
                    var publishDate = item.PublishDate.UtcDateTime;

                    if (string.IsNullOrWhiteSpace(title)) continue;

                    var exists = await _db.Regulations.AsNoTracking().AnyAsync(x => x.Title == title);
                    if (exists) continue;

                    var regulation = new Regulation
                    {
                        Title = title,
                        SourceURL = link,
                        PublishDate = publishDate,
                        Type = "Duyuru",
                        Status = "Yürürlükte",
                        Summary = item.Summary?.Text,
                        LastChecked = DateTime.UtcNow
                    };

                    _db.Regulations.Add(regulation);
                }

                await _db.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RSS check failed");
            }
        }
    }
}
