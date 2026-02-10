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

let player;
let bullets;
let spaceKey;
let canFire = true;
let fireDelay = 250; // 发射间隔（毫秒）
let lastFired = 0;

// 状态信号变量
let bulletsFired = 0;
let activeBullets = 0;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（蓝色矩形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4444ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建子弹纹理（绿色圆形）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0x00ff00, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池（使用物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30, // 对象池最大数量
    runChildUpdate: false
  });

  // 配置子弹组的默认属性
  bullets.children.iterate((bullet) => {
    if (bullet) {
      bullet.body.setAllowGravity(false);
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加键盘控制说明
  this.add.text(10, 550, 'Press SPACE to fire bullets | Arrow keys to move', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  // 创建方向键
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 玩家移动控制
  const speed = 200;
  
  if (this.cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }

  if (this.cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }

  // 发射子弹
  if (spaceKey.isDown && time > lastFired + fireDelay) {
    fireBullet.call(this);
    lastFired = time;
  }

  // 检查并回收离开边界的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检查是否离开世界边界
      if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
        recycleBullet(bullet);
      }
    }
  });

  // 更新状态显示
  updateStatus.call(this);
}

function fireBullet() {
  // 从对象池获取子弹
  let bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向上发射）
    bullet.body.velocity.y = -160;
    bullet.body.velocity.x = 0;
    
    // 更新状态
    bulletsFired++;
    activeBullets++;
  }
}

function recycleBullet(bullet) {
  // 回收子弹到对象池
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.velocity.set(0, 0);
  
  // 更新活跃子弹数
  activeBullets--;
}

function updateStatus() {
  this.statusText.setText([
    `Bullets Fired: ${bulletsFired}`,
    `Active Bullets: ${activeBullets}`,
    `Pool Size: ${bullets.getLength()}`,
    `Pool Max: ${bullets.maxSize}`
  ]);
}

const game = new Phaser.Game(config);