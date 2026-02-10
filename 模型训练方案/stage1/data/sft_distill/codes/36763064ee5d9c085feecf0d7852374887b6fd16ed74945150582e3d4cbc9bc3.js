class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0;
    this.activeBullets = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建粉色子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xFF1493, 1); // 深粉色
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00BFFF, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（物理精灵组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止按键重复触发的冷却时间
    this.shootCooldown = 0;

    // 添加提示文本
    this.add.text(10, 10, 'Press WASD to shoot pink bullets', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 添加状态显示
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });

    // 初始化信号对象
    window.__signals__ = {
      bulletsFired: 0,
      activeBullets: 0,
      maxBullets: 50
    };

    console.log(JSON.stringify({
      event: 'game_start',
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新冷却时间
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    // 检测按键并发射子弹
    if (this.shootCooldown <= 0) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.keyW.isDown) {
        velocityY = -120;
        this.shootBullet(velocityX, velocityY, 'up');
      } else if (this.keyS.isDown) {
        velocityY = 120;
        this.shootBullet(velocityX, velocityY, 'down');
      } else if (this.keyA.isDown) {
        velocityX = -120;
        this.shootBullet(velocityX, velocityY, 'left');
      } else if (this.keyD.isDown) {
        velocityX = 120;
        this.shootBullet(velocityX, velocityY, 'right');
      }
    }

    // 检查子弹是否离开边界并回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新活跃子弹数
    this.activeBullets = this.bullets.countActive(true);

    // 更新显示文本
    this.statsText.setText(
      `Bullets Fired: ${this.bulletsFired}\n` +
      `Active Bullets: ${this.activeBullets}`
    );

    // 更新全局信号
    window.__signals__.bulletsFired = this.bulletsFired;
    window.__signals__.activeBullets = this.activeBullets;
  }

  shootBullet(velocityX, velocityY, direction) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocity(velocityX, velocityY);
      
      // 增加发射计数
      this.bulletsFired++;
      
      // 设置冷却时间（200ms）
      this.shootCooldown = 200;

      // 输出日志
      console.log(JSON.stringify({
        event: 'bullet_fired',
        direction: direction,
        position: { x: this.player.x, y: this.player.y },
        velocity: { x: velocityX, y: velocityY },
        totalFired: this.bulletsFired,
        timestamp: Date.now()
      }));
    }
  }

  recycleBullet(bullet) {
    // 记录回收事件
    console.log(JSON.stringify({
      event: 'bullet_recycled',
      position: { x: bullet.x, y: bullet.y },
      timestamp: Date.now()
    }));

    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);
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