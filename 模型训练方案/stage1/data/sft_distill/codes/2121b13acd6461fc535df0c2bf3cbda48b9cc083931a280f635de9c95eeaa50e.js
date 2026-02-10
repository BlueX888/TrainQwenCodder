class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.spaceKey = null;
    this.lastFired = 0;
    this.fireRate = 200; // 发射间隔（毫秒）
    
    // 可验证的状态信号
    window.__signals__ = {
      bulletsFired: 0,
      playerRotation: 0,
      playerPosition: { x: 0, y: 0 },
      activeBullets: 0
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 顶点（朝向）
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
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

    // 添加说明文字
    this.add.text(10, 10, 'Controls:\nLeft/Right: Rotate\nUp/Space: Fire\nBullet Speed: 80', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
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
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 更新子弹，移除超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.bullets.killAndHide(bullet);
        }
      }
    });

    // 更新状态信号
    window.__signals__.playerRotation = Math.round(this.player.angle);
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.activeBullets = this.bullets.countActive(true);

    // 更新状态显示
    this.statusText.setText(
      `Bullets Fired: ${window.__signals__.bulletsFired} | ` +
      `Active: ${window.__signals__.activeBullets} | ` +
      `Angle: ${window.__signals__.playerRotation}°`
    );
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹位置（从玩家前方发射）
      const offsetX = Math.cos(Phaser.Math.DegToRad(this.player.angle)) * 20;
      const offsetY = Math.sin(Phaser.Math.DegToRad(this.player.angle)) * 20;
      bullet.setPosition(this.player.x + offsetX, this.player.y + offsetY);
      
      // 设置子弹角度
      bullet.setRotation(Phaser.Math.DegToRad(this.player.angle));
      
      // 根据玩家朝向设置子弹速度（速度为 80）
      const bulletSpeed = 400;
      const velocityX = Math.cos(Phaser.Math.DegToRad(this.player.angle)) * bulletSpeed;
      const velocityY = Math.sin(Phaser.Math.DegToRad(this.player.angle)) * bulletSpeed;
      
      bullet.setVelocity(velocityX, velocityY);
      
      // 更新统计
      window.__signals__.bulletsFired++;
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletId: window.__signals__.bulletsFired,
        angle: this.player.angle,
        position: { x: bullet.x, y: bullet.y },
        velocity: { x: velocityX, y: velocityY },
        timestamp: Date.now()
      }));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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