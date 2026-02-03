class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（紫色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x9900ff, 1);
    bulletGraphics.fillCircle(8, 8, 8);
    bulletGraphics.generateTexture('bullet', 16, 16);
    bulletGraphics.destroy();

    // 创建玩家精灵（居中）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 设置方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示发射数量
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 设置发射冷却时间
    this.lastFired = 0;
    this.fireDelay = 200; // 200ms 冷却
  }

  update(time, delta) {
    // 更新统计信息
    this.statsText.setText(`Bullets Fired: ${this.bulletsFired}\nActive: ${this.bullets.countActive(true)}`);

    // 检测方向键并发射子弹
    const canFire = time > this.lastFired + this.fireDelay;
    
    if (canFire) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.cursors.left.isDown) {
        velocityX = -240;
      } else if (this.cursors.right.isDown) {
        velocityX = 240;
      } else if (this.cursors.up.isDown) {
        velocityY = -240;
      } else if (this.cursors.down.isDown) {
        velocityY = 240;
      }

      // 如果有方向键按下，发射子弹
      if (velocityX !== 0 || velocityY !== 0) {
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      }
    }

    // 检查子弹是否离开边界，离开则回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocity(velocityX, velocityY);
      this.bulletsFired++;
    }
  }

  recycleBullet(bullet) {
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

const game = new Phaser.Game(config);