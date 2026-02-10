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

let player;
let bullets;
let spaceKey;
let lastFired = 0;
let fireRate = 200; // 发射间隔（毫秒）

function preload() {
  // 使用 Graphics 创建红色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹组（对象池）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 添加状态显示文本
  this.add.text(10, 10, 'Press SPACE to fire bullets', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    fill: '#00ff00'
  });

  // 添加提示文本
  this.add.text(10, 70, 'Bullets auto-recycle when leaving screen', {
    fontSize: '12px',
    fill: '#aaaaaa'
  });
}

function update(time, delta) {
  // 更新状态显示
  activeBullets = bullets.countActive(true);
  this.statusText.setText(
    `Bullets Fired: ${bulletsFired}\nActive Bullets: ${activeBullets}\nPool Size: ${bullets.getLength()}`
  );

  // 检测空格键按下并发射子弹
  if (spaceKey.isDown && time > lastFired) {
    fireBullet(time);
  }

  // 检查并回收离开边界的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检测子弹是否离开屏幕边界
      if (bullet.y < -20 || bullet.y > 620 || bullet.x < -20 || bullet.x > 820) {
        // 回收子弹到对象池
        bullet.setActive(false);
        bullet.setVisible(false);
        bullet.body.stop();
      }
    }
  });
}

function fireBullet(time) {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y - 20);

  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);

    // 设置子弹速度（向上发射，速度240）
    bullet.body.velocity.y = -240;
    bullet.body.velocity.x = 0;

    // 更新发射时间和计数
    lastFired = time + fireRate;
    bulletsFired++;

    console.log(`Bullet fired! Total: ${bulletsFired}, Active: ${bullets.countActive(true)}`);
  } else {
    console.log('Object pool is full, bullet not fired');
  }
}

// 创建游戏实例
const game = new Phaser.Game(config);