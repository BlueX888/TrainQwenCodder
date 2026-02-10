class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.playerAngle = 0;  // 状态信号：玩家当前角度
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);    // 顶点（前方）
    playerGraphics.lineTo(-10, -10); // 左后
    playerGraphics.lineTo(-10, 10);  // 右后
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.8);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 设置键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    };

    // 射击冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, 'WASD: 改变朝向 | SPACE: 发射子弹', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // WASD控制旋转朝向
    const rotationSpeed = 3; // 度/帧
    
    if (this.keys.W.isDown) {
      this.player.angle = 270; // 上
      this.playerAngle = 270;
    } else if (this.keys.S.isDown) {
      this.player.angle = 90;  // 下
      this.playerAngle = 90;
    } else if (this.keys.A.isDown) {
      this.player.angle = 180; // 左
      this.playerAngle = 180;
    } else if (this.keys.D.isDown) {
      this.player.angle = 0;   // 右
      this.playerAngle = 0;
    }

    // 按下空格发射子弹
    if (this.keys.SPACE.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 20 || bullet.x > bounds.right + 20 ||
            bullet.y < bounds.y - 20 || bullet.y > bounds.bottom + 20) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新活跃子弹数
    this.activeBullets = this.bullets.countActive(true);

    // 更新状态显示
    this.updateStatus();
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (!bullet) {
      return; // 子弹池已满
    }

    bullet.setActive(true);
    bullet.setVisible(true);

    // 根据玩家角度计算子弹速度
    const bulletSpeed = 160;
    const angleRad = Phaser.Math.DegToRad(this.player.angle);
    
    // 计算速度分量
    const velocityX = Math.cos(angleRad) * bulletSpeed;
    const velocityY = Math.sin(angleRad) * bulletSpeed;
    
    bullet.setVelocity(velocityX, velocityY);
    bullet.setRotation(angleRad);

    // 更新状态
    this.bulletsFired++;
  }

  updateStatus() {
    this.statusText.setText([
      `子弹发射总数: ${this.bulletsFired}`,
      `当前活跃子弹: ${this.activeBullets}`,
      `玩家朝向角度: ${this.playerAngle}°`
    ]);
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);