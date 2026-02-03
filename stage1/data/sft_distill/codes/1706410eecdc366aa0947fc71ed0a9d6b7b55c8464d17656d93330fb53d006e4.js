class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.wasd = null;
    this.shootCount = 0;
    this.lastShootTime = 0;
    this.shootCooldown = 200; // 射击冷却时间（毫秒）
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);      // 尖端（朝向）
    playerGraphics.lineTo(-10, -10);   // 左下
    playerGraphics.lineTo(-10, 10);    // 右下
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDrag(200);
    this.player.setMaxVelocity(200);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 监听鼠标点击发射子弹
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.shootBullet();
      }
    });

    // 添加说明文字
    this.add.text(10, 10, 'WASD: Move | A/D: Rotate | Left Click: Shoot', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示射击计数
    this.shootText = this.add.text(10, 40, 'Shots: 0', {
      fontSize: '16px',
      fill: '#ffff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      shootCount: 0,
      playerX: 400,
      playerY: 300,
      playerRotation: 0,
      activeBullets: 0
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now(),
      playerPosition: { x: 400, y: 300 }
    }));
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;
    
    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.physics.velocityFromRotation(
        this.player.rotation,
        speed,
        this.player.body.velocity
      );
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.physics.velocityFromRotation(
        this.player.rotation,
        -speed,
        this.player.body.velocity
      );
    }

    // 玩家旋转控制
    const rotationSpeed = 3;
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.rotation -= rotationSpeed * (delta / 1000);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.rotation += rotationSpeed * (delta / 1000);
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 20 || bullet.x > bounds.right + 20 ||
            bullet.y < bounds.y - 20 || bullet.y > bounds.bottom + 20) {
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
        }
      }
    });

    // 更新信号状态
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.playerRotation = parseFloat(this.player.rotation.toFixed(2));
    window.__signals__.activeBullets = this.bullets.countActive(true);
  }

  shootBullet() {
    const currentTime = this.time.now;
    
    // 检查射击冷却
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return;
    }

    this.lastShootTime = currentTime;

    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 设置子弹位置（从玩家前方发射）
      const offsetX = Math.cos(this.player.rotation) * 20;
      const offsetY = Math.sin(this.player.rotation) * 20;
      bullet.setPosition(this.player.x + offsetX, this.player.y + offsetY);
      
      // 设置子弹旋转角度
      bullet.setRotation(this.player.rotation);
      
      // 设置子弹速度（按玩家朝向发射，速度 300）
      this.physics.velocityFromRotation(
        this.player.rotation,
        300,
        bullet.body.velocity
      );

      // 更新射击计数
      this.shootCount++;
      this.shootText.setText('Shots: ' + this.shootCount);
      window.__signals__.shootCount = this.shootCount;

      // 记录射击事件
      console.log(JSON.stringify({
        event: 'bullet_fired',
        timestamp: Date.now(),
        shootCount: this.shootCount,
        position: {
          x: Math.round(bullet.x),
          y: Math.round(bullet.y)
        },
        rotation: parseFloat(this.player.rotation.toFixed(2)),
        velocity: {
          x: Math.round(bullet.body.velocity.x),
          y: Math.round(bullet.body.velocity.y)
        }
      }));
    }
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);