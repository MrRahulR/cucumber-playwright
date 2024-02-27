Feature: Login Feature

    This test will run login module test cases

    Background: Initialization
        Given user opens the website

    Scenario Outline: Invalid Login
        Given user enters "<username>" and "<password>"
        When user clicks on Login button
        Then user should see the "<error>" message

        Examples:
            | username       | password | error                        |
            | user@gmail.com |          | Password is required         |
            |                | Test@123 | Email is required            |
            |                |          | Email is required            |
            | user@gmail.com | Test@123 | Incorrect email or password. |

    Scenario Outline: Valid Login
        Given user enters "<username>" and "<password>"
        When user clicks on Login button
        Then user should redirect to the Home screen

        Examples:
            | username          | password    |
            | anshika@gmail.com | Iamking@000 |
