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

// 可验证的状态信号
let bulletsFired = 0;
let activeBullets = 0;

let bulletsGroup;
let spaceKey;
let lastFireTime = 0;
let fireDelay = 200; // 发射间隔（毫秒）
let playerX = 400;
let playerY = 500;
let statusText;

function preload() {
  // 使用 Graphics 创建子弹纹理
  const graphics = this.add.graphics();
  
  // 绘制蓝色子弹（圆形）
  graphics.fillStyle(0x0088ff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();
  
  // 绘制玩家（绿色三角形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.beginPath();
  playerGraphics.moveTo(16, 0);
  playerGraphics.lineTo(0, 32);
  playerGraphics.lineTo(32, 32);
  playerGraphics.closePath();
  playerGraphics.fillPath();
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家
  const player = this.add.sprite(playerX, playerY, 'player');
  
  // 创建子弹对象池（使用物理组）
  bulletsGroup = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20, // 对象池最大容量
    runChildUpdate: false,
    createCallback: function(bullet) {
      // 子弹创建时的初始化
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  updateStatusText();
  
  // 添加说明文本
  this.add.text(10, 560, 'Press SPACE to fire bullets', {
    fontSize: '16px',
    fill: '#ffff00'
  });
}

function update(time, delta) {
  // 检测空格键按下
  if (spaceKey.isDown && time > lastFireTime + fireDelay) {
    fireBullet(time);
  }
  
  // 检查所有活动子弹，回收超出边界的子弹
  bulletsGroup.children.entries.forEach(bullet => {
    if (bullet.active) {
      // 检测是否离开边界
      if (bullet.y < -20 || bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
        recycleBullet(bullet);
      }
    }
  });
  
  // 更新活动子弹数量
  activeBullets = bulletsGroup.countActive(true);
  updateStatusText();
}

function fireBullet(time) {
  // 从对象池获取子弹
  const bullet = bulletsGroup.get(playerX, playerY);
  
  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向上发射）
    bullet.body.velocity.y = -240;
    bullet.body.velocity.x = 0;
    
    // 更新计数器
    bulletsFired++;
    lastFireTime = time;
    
    console.log(`Bullet fired! Total: ${bulletsFired}, Active: ${activeBullets + 1}`);
  } else {
    console.log('Object pool is full!');
  }
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.velocity.set(0);
  
  console.log(`Bullet recycled. Active bullets: ${activeBullets - 1}`);
}

function updateStatusText() {
  statusText.setText([
    `Bullets Fired: ${bulletsFired}`,
    `Active Bullets: ${activeBullets}`,
    `Pool Size: ${bulletsGroup.getLength()}`,
    `Pool Available: ${bulletsGroup.maxSize - bulletsGroup.countActive(true)}`
  ]);
}

// 启动游戏
new Phaser.Game(config);