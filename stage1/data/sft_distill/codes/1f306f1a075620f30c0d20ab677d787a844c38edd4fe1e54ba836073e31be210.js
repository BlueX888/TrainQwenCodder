// 完整的 Phaser3 追踪镜头与震屏游戏
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  }
};

// 全局状态信号
window.__signals__ = {
  health: 100,
  collisionCount: 0,
  shakeTriggered: false,
  lastCollisionTime: 0
};

let player;
let enemy;
let cursors;
let healthText;
let infoText;
let camera;
let canCollide = true; // 防止连续碰撞

function preload() {
  // 使用 Graphics 创建纹理，不依赖外部资源
  
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();
  
  // 创建敌人纹理（红色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff3333, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(40, 40);
  
  // 创建敌人
  enemy = this.physics.add.sprite(200, 150, 'enemy');
  enemy.setCollideWorldBounds(true);
  enemy.body.setSize(40, 40);
  
  // 给敌人随机初始速度
  enemy.setVelocity(
    Phaser.Math.Between(-100, 100),
    Phaser.Math.Between(-100, 100)
  );
  
  // 设置镜头跟随玩家
  camera = this.cameras.main;
  camera.startFollow(player, true, 0.1, 0.1);
  camera.setZoom(1);
  
  // 设置碰撞检测
  this.physics.add.collider(player, enemy, handleCollision, null, this);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 创建生命值显示文本（固定在镜头上）
  healthText = this.add.text(16, 16, 'Health: 100', {
    fontSize: '24px',
    fill: '#00ff00',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 4
  });
  healthText.setScrollFactor(0); // 固定在镜头上
  
  // 创建信息文本
  infoText = this.add.text(16, 50, 'Use Arrow Keys to Move\nCollide with enemy to trigger shake', {
    fontSize: '16px',
    fill: '#ffffff',
    fontFamily: 'Arial',
    stroke: '#000000',
    strokeThickness: 3
  });
  infoText.setScrollFactor(0);
  
  // 日志初始状态
  console.log('Game Started:', JSON.stringify(window.__signals__));
}

function update(time, delta) {
  // 玩家移动控制
  const speed = 200;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }
  
  // 敌人随机改变方向
  if (Phaser.Math.Between(0, 100) < 2) {
    enemy.setVelocity(
      Phaser.Math.Between(-150, 150),
      Phaser.Math.Between(-150, 150)
    );
  }
  
  // 敌人碰到边界反弹
  if (enemy.body.blocked.left || enemy.body.blocked.right) {
    enemy.setVelocityX(-enemy.body.velocity.x);
  }
  if (enemy.body.blocked.up || enemy.body.blocked.down) {
    enemy.setVelocityY(-enemy.body.velocity.y);
  }
  
  // 更新生命值显示颜色
  if (window.__signals__.health > 60) {
    healthText.setFill('#00ff00');
  } else if (window.__signals__.health > 30) {
    healthText.setFill('#ffaa00');
  } else {
    healthText.setFill('#ff0000');
  }
}

function handleCollision(playerSprite, enemySprite) {
  // 防止连续触发
  if (!canCollide) return;
  
  canCollide = false;
  
  // 扣减生命值
  window.__signals__.health -= 10;
  window.__signals__.collisionCount++;
  window.__signals__.shakeTriggered = true;
  window.__signals__.lastCollisionTime = Date.now();
  
  // 更新生命值显示
  healthText.setText('Health: ' + window.__signals__.health);
  
  // 触发镜头震动 2 秒
  camera.shake(2000, 0.01);
  
  // 玩家闪烁效果
  playerSprite.setTint(0xff0000);
  
  // 输出日志
  console.log('Collision Detected:', JSON.stringify({
    health: window.__signals__.health,
    collisionCount: window.__signals__.collisionCount,
    timestamp: window.__signals__.lastCollisionTime
  }));
  
  // 检查游戏结束
  if (window.__signals__.health <= 0) {
    window.__signals__.health = 0;
    healthText.setText('Health: 0 - GAME OVER!');
    healthText.setFill('#ff0000');
    playerSprite.setVelocity(0, 0);
    playerSprite.body.enable = false;
    console.log('Game Over:', JSON.stringify(window.__signals__));
    return;
  }
  
  // 2秒后恢复碰撞检测和玩家颜色
  setTimeout(() => {
    canCollide = true;
    playerSprite.clearTint();
    window.__signals__.shakeTriggered = false;
  }, 2000);
}

// 启动游戏
new Phaser.Game(config);