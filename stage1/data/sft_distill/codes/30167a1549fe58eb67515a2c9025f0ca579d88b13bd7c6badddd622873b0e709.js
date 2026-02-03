class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.spaceKey = null;
    this.lastFired = 0;
    this.fireRate = 200; // 射击间隔（毫秒）
    
    // 可验证信号
    window.__signals__ = {
      shotsFired: 0,
      activeBullets: 0,
      playerRotation: 0,
      playerX: 0,
      playerY: 0
    };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 生成玩家纹理（三角形，指示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（前方）
    playerGraphics.lineTo(-10, -10); // 左后
    playerGraphics.lineTo(-10, 10);  // 右后
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 生成子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys: Rotate\nSpace: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示状态文本
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    console.log(JSON.stringify({
      event: 'game_started',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 射击控制
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.shoot();
      this.lastFired = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -10 || bullet.x > 810 || bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新可验证信号
    window.__signals__.activeBullets = this.bullets.countActive(true);
    window.__signals__.playerRotation = this.player.angle;
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);

    // 更新状态显示
    this.statusText.setText(
      `Shots: ${window.__signals__.shotsFired} | ` +
      `Active Bullets: ${window.__signals__.activeBullets} | ` +
      `Angle: ${Math.round(this.player.angle)}°`
    );
  }

  shoot() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (!bullet) {
      return; // 子弹池已满
    }

    bullet.setActive(true);
    bullet.setVisible(true);

    // 计算子弹发射角度（玩家角度转弧度）
    const angleRad = Phaser.Math.DegToRad(this.player.angle);
    
    // 根据角度计算速度向量
    const velocityX = Math.cos(angleRad) * 300;
    const velocityY = Math.sin(angleRad) * 300;
    
    bullet.setVelocity(velocityX, velocityY);
    bullet.setRotation(angleRad);

    // 更新信号
    window.__signals__.shotsFired++;

    // 输出射击事件日志
    console.log(JSON.stringify({
      event: 'bullet_fired',
      shotNumber: window.__signals__.shotsFired,
      angle: Math.round(this.player.angle),
      position: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      velocity: {
        x: Math.round(velocityX),
        y: Math.round(velocityY)
      },
      timestamp: Date.now()
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);