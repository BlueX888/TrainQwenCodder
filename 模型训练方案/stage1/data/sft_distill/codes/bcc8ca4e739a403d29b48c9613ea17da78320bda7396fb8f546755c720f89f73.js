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
  bulletsShot: 0,
  activeBullets: 0,
  recycledBullets: 0
};

let bullets;
let player;

function preload() {
  // 创建白色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(8, 8, 8);
  graphics.generateTexture('bullet', 16, 16);
  graphics.destroy();

  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池（物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50,
    runChildUpdate: false
  });

  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    // 只响应左键
    if (pointer.leftButtonDown()) {
      shootBullet.call(this, pointer);
    }
  });

  // 添加提示文本
  this.add.text(10, 10, 'Click Left Mouse Button to Shoot', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 添加状态显示文本
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#00ff00'
  });

  // 输出初始状态
  console.log(JSON.stringify({
    event: 'game_start',
    signals: window.__signals__
  }));
}

function shootBullet(pointer) {
  // 从对象池获取子弹
  const bullet = bullets.get(player.x, player.y);

  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);

    // 计算从玩家到鼠标位置的方向向量
    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );

    // 设置子弹速度（速度80）
    const velocityX = Math.cos(angle) * 80;
    const velocityY = Math.sin(angle) * 80;
    bullet.body.setVelocity(velocityX, velocityY);

    // 更新信号
    window.__signals__.bulletsShot++;
    window.__signals__.activeBullets = bullets.countActive(true);

    // 输出发射事件
    console.log(JSON.stringify({
      event: 'bullet_shot',
      position: { x: player.x, y: player.y },
      target: { x: pointer.x, y: pointer.y },
      velocity: { x: velocityX, y: velocityY },
      signals: window.__signals__
    }));
  }
}

function update() {
  // 检查所有活跃子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检查子弹是否离开边界
      if (
        bullet.x < -20 ||
        bullet.x > 820 ||
        bullet.y < -20 ||
        bullet.y > 620
      ) {
        // 回收子弹
        bullets.killAndHide(bullet);
        bullet.body.reset(0, 0);

        // 更新信号
        window.__signals__.recycledBullets++;
        window.__signals__.activeBullets = bullets.countActive(true);

        // 输出回收事件
        console.log(JSON.stringify({
          event: 'bullet_recycled',
          signals: window.__signals__
        }));
      }
    }
  });

  // 更新状态显示
  if (this.statusText) {
    this.statusText.setText([
      `Bullets Shot: ${window.__signals__.bulletsShot}`,
      `Active Bullets: ${window.__signals__.activeBullets}`,
      `Recycled Bullets: ${window.__signals__.recycledBullets}`
    ]);
  }
}

new Phaser.Game(config);