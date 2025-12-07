USE legislation_db;
SELECT COUNT(*) as total FROM RegulationArticles WHERE RegulationId=1;
SELECT Code, LEFT(Title, 100) as Title, LEFT(Text, 100) as TextPreview FROM RegulationArticles WHERE RegulationId=1 ORDER BY OrderNo LIMIT 10;
