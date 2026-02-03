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
let bulletsFired = 0; // 可验证状态：发射的子弹总数
let activeBullets = 0; // 可验证状态：当前活跃子弹数
let statsText;

function preload() {
  // 使用 Graphics 生成纹理，不依赖外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4444ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建子弹纹理（绿色圆形）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0x00ff00, 1);
  bulletGraphics.fillCircle(8, 8, 8);
  bulletGraphics.generateTexture('bullet', 16, 16);
  bulletGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池（使用物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30, // 对象池最大容量
    runChildUpdate: true
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加方向键控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 创建状态文本
  statsText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加说明文本
  this.add.text(10, 560, 'Arrow Keys: Move | Space: Fire', {
    fontSize: '14px',
    fill: '#aaaaaa'
  });

  updateStatsText();
}

function update() {
  // 玩家移动控制
  if (this.cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  if (this.cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (this.cursors.down.isDown) {
    player.setVelocityY(200);
  } else {
    player.setVelocityY(0);
  }

  // 空格键发射子弹（按住连发，添加冷却时间）
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    fireBullet();
  }

  // 检测并回收离开边界的子弹
  activeBullets = 0;
  bullets.children.entries.forEach(bullet => {
    if (bullet.active) {
      activeBullets++;
      // 检测是否离开屏幕边界
      if (bullet.x < -20 || bullet.x > 820 || 
          bullet.y < -20 || bullet.y > 620) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.setVelocity(0, 0);
      }
    }
  });

  updateStatsText();
}

function fireBullet() {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    
    // 设置子弹速度（向上发射，速度160）
    bullet.body.setVelocity(0, -160);
    
    // 增加发射计数
    bulletsFired++;
  }
}

function updateStatsText() {
  statsText.setText([
    `Bullets Fired: ${bulletsFired}`,
    `Active Bullets: ${activeBullets}`,
    `Pool Size: ${bullets.getLength()}`,
    `Pool Max: ${bullets.maxSize}`
  ]);
}

const game = new Phaser.Game(config);