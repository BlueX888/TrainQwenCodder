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

// 全局信号对象，用于验证
window.__signals__ = {
  bulletsShot: 0,
  activeBullets: 0,
  bulletsRecycled: 0
};

let bullets;
let player;

function preload() {
  // 创建灰色子弹纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(8, 8, 8); // 半径8的圆形
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
  // 创建玩家精灵（位于屏幕中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建子弹对象池（使用物理组）
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50, // 对象池最大容量
    runChildUpdate: false
  });

  // 监听鼠标右键点击
  this.input.on('pointerdown', (pointer) => {
    if (pointer.rightButtonDown()) {
      shootBullet.call(this, pointer);
    }
  });

  // 添加说明文本
  this.add.text(10, 10, '右键点击发射灰色子弹', {
    fontSize: '16px',
    color: '#ffffff'
  });

  // 添加状态显示文本
  this.statusText = this.add.text(10, 40, '', {
    fontSize: '14px',
    color: '#ffff00'
  });

  // 日志初始状态
  console.log(JSON.stringify({
    event: 'game_start',
    timestamp: Date.now(),
    signals: window.__signals__
  }));
}

function shootBullet(pointer) {
  // 从对象池获取子弹
  let bullet = bullets.get(player.x, player.y);

  if (bullet) {
    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);

    // 计算从玩家到鼠标点击位置的方向
    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );

    // 设置子弹速度（速度120）
    const velocityX = Math.cos(angle) * 120;
    const velocityY = Math.sin(angle) * 120;
    bullet.setVelocity(velocityX, velocityY);

    // 更新信号
    window.__signals__.bulletsShot++;
    window.__signals__.activeBullets = bullets.countActive(true);

    // 日志发射事件
    console.log(JSON.stringify({
      event: 'bullet_shot',
      timestamp: Date.now(),
      position: { x: player.x, y: player.y },
      velocity: { x: velocityX, y: velocityY },
      signals: window.__signals__
    }));
  }
}

function update(time, delta) {
  // 检查所有活跃的子弹
  bullets.children.entries.forEach((bullet) => {
    if (bullet.active) {
      // 检查子弹是否离开边界
      if (
        bullet.x < -20 ||
        bullet.x > 820 ||
        bullet.y < -20 ||
        bullet.y > 620
      ) {
        // 回收子弹到对象池
        bullets.killAndHide(bullet);
        bullet.setVelocity(0, 0);

        // 更新信号
        window.__signals__.bulletsRecycled++;
        window.__signals__.activeBullets = bullets.countActive(true);

        // 日志回收事件
        console.log(JSON.stringify({
          event: 'bullet_recycled',
          timestamp: Date.now(),
          signals: window.__signals__
        }));
      }
    }
  });

  // 更新状态文本
  if (this.statusText) {
    this.statusText.setText([
      `发射次数: ${window.__signals__.bulletsShot}`,
      `活跃子弹: ${window.__signals__.activeBullets}`,
      `回收次数: ${window.__signals__.bulletsRecycled}`,
      `对象池大小: ${bullets.getLength()}`
    ]);
  }
}

// 启动游戏
new Phaser.Game(config);