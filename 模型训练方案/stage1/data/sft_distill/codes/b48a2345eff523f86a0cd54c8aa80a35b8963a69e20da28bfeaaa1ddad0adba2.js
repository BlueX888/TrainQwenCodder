class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff0000, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹物理组（对象池）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 监听鼠标移动，更新玩家朝向
    this.input.on('pointermove', (pointer) => {
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );
      this.player.rotation = angle;
    });

    // 监听鼠标点击，发射子弹
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.fireBullet();
      }
    });

    // 初始化状态信号
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      playerAngle: 0,
      playerPosition: { x: 400, y: 300 }
    };

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  fireBullet() {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家当前角度设置子弹速度
      const speed = 300;
      const velocityX = Math.cos(this.player.rotation) * speed;
      const velocityY = Math.sin(this.player.rotation) * speed;
      
      bullet.setVelocity(velocityX, velocityY);
      bullet.setRotation(this.player.rotation);
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets = this.bullets.countActive(true);
      
      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        bulletsFired: this.bulletsFired,
        angle: this.player.rotation,
        position: { x: this.player.x, y: this.player.y }
      }));
    }
  }

  update(time, delta) {
    // 清理出界的子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否出界
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.setVelocity(0, 0);
        }
      }
    });

    // 更新活跃子弹数量
    this.activeBullets = this.bullets.countActive(true);

    // 更新状态信号
    window.__signals__ = {
      bulletsFired: this.bulletsFired,
      activeBullets: this.activeBullets,
      playerAngle: Phaser.Math.RadToDeg(this.player.rotation).toFixed(1),
      playerPosition: { 
        x: Math.round(this.player.x), 
        y: Math.round(this.player.y) 
      }
    };

    // 更新显示文本
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Player Angle: ${window.__signals__.playerAngle}°`,
      `Position: (${window.__signals__.playerPosition.x}, ${window.__signals__.playerPosition.y})`
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