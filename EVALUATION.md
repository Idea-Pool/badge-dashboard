# Approach

## Background

It would be great if there would be a possibility to create a **custom dashboard**, for certain badges, a place where these badges and their receivers would be displayed.

For example, if a community uses certain badges (own or the shared community badges), they might have good use of such a dashboard, where they can present the top speaker, the top contributors, etc. Like Idea Pool, where we have our Idea Pool Presenter badge (given 131 times, has 5 levels) which can be displayed on this dashboard, by each level, displaying those profiles pictures who are on that certain level.

_Note, that there are already similar dashboards on the Heroes portal, but those are custom developments for the portal, thus cannot be used for our purpose._

## Goal

The goal of this proof-of-concept is to create a standalone solution, which:
 - displays certain badges (a given list of badges),
 - lists the people who received those badges (name, picture, title, number of the given badge)
 - displays badges per the badge levels (where it is applicable),
 - can consume data exported from **Heroes** portal (XLS, exported from Heroes Admin).

## Decisions to make

### Resources

How should we retrieve the images (badge, profile images) displayed on the dashboard?

1. **Static**: All images are saved manually as static resources.
1. **Semi-Dynamic**: All images are saved by a script on demand as static resource and the saved static resources used on the dashboard.
1. **Dynamic**: All images are used from their source (Heroes, Upsa) dynamically on the dashboard.

| Approach         | Pros. | Cons. |
|:-----------------|:------|:------|
| **Static**       | - Quicker served static images<br>- No need to implement authentication to Heroes/UPSA | - Need to be updated with all new badge/people |
| **Semi-Dynamic** | - Automatically updated when necessary<br>- Quicker served static images | - Need to have access to Heroes/UPSA to download |
| **Dynamic**      | - No need to save images with application<br>- New images automatically retrieved when necessary | - Need to have live access to Heroes/UPSA to download<br>- Depends on Heroes/UPSA to retrieve images |

Winner: _TBD_

### Data format

In what format, should we store the badge assignment data which will be displayed by the dashboard?

1. **Original**: The assignment data is stored in the original input format (XLS) and that is used during rendering.
1. **JSON**: The assignment data is stored in a convenient JSON format which is produced from the original input format, and that is used during rendering.
1. **No data**: In case of **static rendering**, there is no need for the data to be stored with the application, given that the page is already rendered from the data.

| Approach     | Pros. | Cons. |
|:-------------|:------|:------|
| **Original** | _TBD_ | _TBD_ |
| **JSON**     | _TBD_ | _TBD_ |
| **No data**  | _TBD_ | _TBD_ |

Winner: _TBD_

### Synchronization

How often, and how the synchronization, actualization of the data will be done?

1. **On demand**: The assignment data is refreshed on demand, when necessary (e.g. when we know that a new badge is assigned).
1. **Scheduled**: The assignment data is refreshed on schedule, based on the badge assignment frequency (e.g. per month/week).
1. **Live**: The assignment data is retrieved when the page is loaded (with caching) and the dashboard show the current status all the time.

| Approach      | Pros. | Cons. |
|:--------------|:------|:------|
| **On demand** | _TBD_ | _TBD_ |
| **Scheduled** | _TBD_ | _TBD_ |
| **Live**      | _TBD_ | _TBD_ |

Winner: _TBD_

### Rendering

How should we render/display the actual dashboard page?

1. **Static**: The whole dashboard (HTML, CSS) is rendered once, per build and the static page is displayed all the time.
1. **Dynamic**: The dashboard is rendered on visit from the current assigment data set.

| Approach    | Pros. | Cons. |
|:------------|:------|:------|
| **Static**  | _TBD_ | _TBD_ |
| **Dynamic** | _TBD_ | _TBD_ |

Winner: _TBD_

### Technology

What technology should be used for the dashboard?

1. **JS/TS**: NodeJS server and EJS templating enginer or React/Gatsby.
1. **Java**: Java Spring application with any templating enginer.

| Approach  | Pros. | Cons. |
|:----------|:------|:------|
| **JS/TS** | _TBD_ | _TBD_ |
| **Java**  | _TBD_ | _TBD_ |

Winner: _TBD_

## Approach

_TBD_