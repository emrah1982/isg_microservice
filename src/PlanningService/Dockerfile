FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY src/PlanningService/PlanningService.csproj src/PlanningService/
RUN dotnet restore src/PlanningService/PlanningService.csproj
COPY src/PlanningService/ src/PlanningService/
WORKDIR /src/src/PlanningService
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PlanningService.dll"]
