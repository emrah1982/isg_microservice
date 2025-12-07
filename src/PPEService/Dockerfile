# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy sln and restore
COPY ISG-Microservices.sln ./
COPY src/PPEService/PPEService.csproj src/PPEService/
RUN dotnet restore src/PPEService/PPEService.csproj

# copy all and publish
COPY src/PPEService/ src/PPEService/
RUN dotnet publish src/PPEService/PPEService.csproj -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8088
ENV ASPNETCORE_URLS=http://+:8088
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "PPEService.dll"]
