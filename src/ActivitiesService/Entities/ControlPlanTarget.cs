namespace ActivitiesService.Entities;

public class ControlPlanTarget
{
    public int Id { get; set; }
    public int ControlPlanId { get; set; }
    public int MachineId { get; set; }

    public ControlPlan? ControlPlan { get; set; }
    public Machine? Machine { get; set; }
}
