# PetPro Coding Standards

This document outlines the coding standards and best practices for all PetPro repositories. Following these guidelines ensures code quality, maintainability, and consistency across the codebase.

## General Guidelines

- Use clear, descriptive variable and function names
- Write self-documenting code with comments where needed
- Follow the DRY (Don't Repeat Yourself) principle
- Keep functions small and focused on a single responsibility
- Properly handle errors and edge cases
- Write tests for all code

## Backend (Node.js/TypeScript)

### Code Style

- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use ESLint and Prettier for code formatting
- Use async/await instead of promises when possible
- Use meaningful variable names that describe their purpose

### Structure

- Organize code using feature-based folders
- Follow the MVC pattern where appropriate
- Keep controllers thin, move business logic to services
- Use dependency injection for better testability
- Use environment variables for configuration

### Example

```typescript
// Good
async function getUserById(userId: string): Promise<User> {
  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`, { userId });
    throw error;
  }
}

// Bad
async function get(id) {
  return db.users.findById(id);
}
```

## Frontend (React/Next.js)

### Code Style

- Use functional components with hooks
- Use TypeScript for all new code
- Follow component composition patterns
- Use CSS-in-JS (styled-components or emotion) for styling
- Use proper prop-types or TypeScript interfaces

### Structure

- Organize by feature or module
- Separate business logic from UI components
- Create reusable UI components in a dedicated folder
- Use context API or Redux for state management
- Implement proper error boundaries

### Example

```tsx
// Good
interface UserProfileProps {
  user: User;
  onUpdateProfile: (user: User) => Promise<void>;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <ProfileCard>
      <UserAvatar src={user.avatarUrl} alt={user.name} />
      <UserInfo>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </UserInfo>
      {isEditing ? (
        <ProfileEditForm user={user} onSubmit={onUpdateProfile} />
      ) : (
        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
      )}
    </ProfileCard>
  );
};

// Bad
const Profile = (props) => {
  const [edit, setEdit] = useState(false);
  
  return (
    <div className="profile-container">
      <img src={props.user.img} />
      <div>
        <h3>{props.user.name}</h3>
        <p>{props.user.email}</p>
      </div>
      {edit ? <EditForm /> : <button onClick={() => setEdit(true)}>Edit</button>}
    </div>
  );
};
```

## Mobile App (React Native)

### Code Style

- Use TypeScript for type safety
- Follow React Native community best practices
- Implement responsive designs using flexbox
- Use React Navigation for navigation
- Use Redux Toolkit for state management

### Structure

- Organize by feature
- Separate business logic from UI components
- Create reusable UI components
- Use hooks for shared functionality
- Properly handle device-specific code

### Example

```tsx
// Good
const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(product.id)}
      accessibilityLabel={`View ${product.name} details`}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Bad
function Product({ prod }) {
  return (
    <TouchableOpacity onPress={() => handlePress(prod.id)}>
      <Image source={{ uri: prod.img }} />
      <View>
        <Text>{prod.name}</Text>
        <Text>${prod.price}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

## Database

### SQL Queries

- Use prepared statements to prevent SQL injection
- Keep queries simple and readable
- Use indexes for frequently queried columns
- Write descriptive comments for complex queries
- Use migrations for schema changes

### NoSQL

- Design schemas based on query patterns
- Avoid deeply nested documents
- Use consistent naming conventions
- Consider denormalization for performance

## API Design

- Follow RESTful or GraphQL principles
- Use HTTP methods appropriately
- Use consistent naming conventions
- Implement proper error handling and status codes
- Document all endpoints with OpenAPI/Swagger

## Testing

- Write unit tests for all business logic
- Create integration tests for API endpoints
- Implement end-to-end tests for critical user flows
- Use test-driven development when appropriate
- Mock external dependencies in tests

## Version Control

- Write clear, descriptive commit messages
- Use feature branches for new development
- Submit pull requests for code reviews
- Keep PRs reasonably sized for effective review
- Squash commits before merging when appropriate

## Security

- Never commit secrets or credentials
- Validate all user inputs
- Implement proper authentication and authorization
- Follow OWASP security guidelines
- Regularly update dependencies

## Documentation

- Document all APIs
- Create README files for all repositories
- Document complex algorithms and business logic
- Update documentation when making changes
- Use JSDoc or similar for function documentation

## Accessibility

- Ensure proper semantic HTML elements
- Implement keyboard navigation
- Use ARIA attributes when appropriate
- Test with screen readers
- Follow WCAG guidelines

## Performance

- Optimize bundle sizes
- Implement lazy loading
- Use memoization for expensive calculations
- Optimize API calls with caching
- Monitor and address performance bottlenecks

## Continuous Integration/Deployment

- Automate testing and deployment
- Implement linting in the CI pipeline
- Use feature flags for controlled rollouts
- Implement proper monitoring and alerting
- Use staging environments for testing before production
