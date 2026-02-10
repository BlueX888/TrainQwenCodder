const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let player;
let enemies;
let cursors;
let healthText;
let health = 100;
let canTakeDamage = true;
let camera;

function preload() {
  // 使用 Graphics 程序化生成纹理，无需外部资源
}

function create() {
  // 获取主相机
  camera = this.cameras.main;
  
  // 设置世界边界，使其大于视口以便相机追踪
  this.physics.world.setBounds(0, 0, 1600, 1200);
  
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
  
  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
  
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(300, 300);
  player.setDrag(500, 500);
  
  // 设置相机追踪玩家
  camera.startFollow(player, true, 0.1, 0.1);
  camera.setBounds(0, 0, 1600, 1200);
  
  // 创建敌人组
  enemies = this.physics.add.group();
  
  // 在世界中随机生成5个敌人
  for (let i = 0; i < 5; i++) {
    const x = Phaser.Math.Between(100, 1500);
    const y = Phaser.Math.Between(100, 1100);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setCollideWorldBounds(true);
    
    // 给敌人添加随机移动
    enemy.setVelocity(
      Phaser.Math.Between(-100, 100),
      Phaser.Math.Between(-100, 100)
    );
    enemy.setBounce(1, 1);
  }
  
  // 添加碰撞检测
  this.physics.add.collider(player, enemies, handleCollision, null, this);
  
  // 创建生命值显示（固定在屏幕左上角）
  healthText = this.add.text(16, 16, `Health: ${health}`, {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  healthText.setScrollFactor(0); // 固定在相机视图中
  
  // 创建控制提示文本
  const instructions = this.add.text(16, 50, 'Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructions.setScrollFactor(0);
  
  // 创建状态信息文本
  const statusText = this.add.text(16, 80, 'Collide with enemies to trigger shake!', {
    fontSize: '14px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  statusText.setScrollFactor(0);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  // 玩家移动控制
  const speed = 200;
  
  if (cursors.left.isDown) {
    player.setAccelerationX(-speed);
  } else if (cursors.right.isDown) {
    player.setAccelerationX(speed);
  } else {
    player.setAccelerationX(0);
  }
  
  if (cursors.up.isDown) {
    player.setAccelerationY(-speed);
  } else if (cursors.down.isDown) {
    player.setAccelerationY(speed);
  } else {
    player.setAccelerationY(0);
  }
  
  // 检查生命值，如果为0则游戏结束
  if (health <= 0) {
    healthText.setText('Health: 0 - GAME OVER!');
    healthText.setStyle({ fill: '#ff0000' });
    this.physics.pause();
  }
}

function handleCollision(player, enemy) {
  // 检查是否可以受到伤害（避免连续碰撞造成多次伤害）
  if (!canTakeDamage) {
    return;
  }
  
  canTakeDamage = false;
  
  // 扣减生命值
  health -= 10;
  if (health < 0) health = 0;
  
  // 更新生命值显示
  healthText.setText(`Health: ${health}`);
  
  // 生命值低时改变颜色
  if (health <= 30) {
    healthText.setStyle({ fill: '#ff0000' });
  } else if (health <= 60) {
    healthText.setStyle({ fill: '#ffaa00' });
  }
  
  // 触发相机震动效果，持续2.5秒（2500毫秒）
  camera.shake(2500, 0.01);
  
  // 玩家闪烁效果
  player.setTint(0xff0000);
  
  // 击退效果
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  player.setVelocity(
    Math.cos(angle) * 300,
    Math.sin(angle) * 300
  );
  
  // 2.5秒后恢复受伤状态和玩家颜色
  setTimeout(() => {
    canTakeDamage = true;
    player.clearTint();
  }, 2500);
  
  // 输出日志用于验证
  console.log(`Collision! Health: ${health}, Camera shake triggered for 2.5s`);
}

const game = new Phaser.Game(config);