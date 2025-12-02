
'use client'

import { useState } from 'react';
import { users as initialUsers } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { User } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getAllUsers, mapBackendUserToFrontendUserWithoutUserKey } from '@/api/auth';
import { useEffect } from 'react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const mappedUsers = data.users.map((backendUser: any) => mapBackendUserToFrontendUserWithoutUserKey(backendUser));
        const filteredUsers = mappedUsers.filter((u: User) => u.type !== 'Admin');
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);


  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveChanges = () => {
    if (selectedUser) {
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedUser) {
        const { name, value } = e.target;
        setSelectedUser({ ...selectedUser, [name]: value });
    }
  }


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>View and edit all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Bio</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.map(user => {
                    const avatar = PlaceHolderImages.find(p => p.id === user.avatarId);
                    return (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={avatar?.imageUrl} alt={user.name} data-ai-hint={avatar?.imageHint} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                </div>
                            </TableCell>
                            <TableCell><Badge variant={user.type === 'Player' ? 'default' : 'secondary'}>{user.type}</Badge></TableCell>
                            <TableCell className="max-w-sm truncate">{user.bio}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(user)}>
                                Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" value={selectedUser.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                  Bio
                </Label>
                <Input id="bio" name="bio" value={selectedUser.bio} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
