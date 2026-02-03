class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建灰色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建玩家（用于发射子弹的中心点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(-16, -16, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（物理组）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 配置 WASD 键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 防止连续发射的冷却时间
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 检查是否可以发射（冷却时间）
    const canFire = time > this.lastFired + this.fireRate;

    // WASD 键发射子弹
    if (canFire) {
      let velocityX = 0;
      let velocityY = 0;

      if (this.keyW.isDown) {
        velocityY = -200; // 向上
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      } else if (this.keyS.isDown) {
        velocityY = 200; // 向下
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      } else if (this.keyA.isDown) {
        velocityX = -200; // 向左
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      } else if (this.keyD.isDown) {
        velocityX = 200; // 向右
        this.fireBullet(velocityX, velocityY);
        this.lastFired = time;
      }
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 20 || 
            bullet.x > bounds.x + bounds.width + 20 ||
            bullet.y < bounds.y - 20 || 
            bullet.y > bounds.y + bounds.height + 20) {
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateStatusText();
  }

  fireBullet(velocityX, velocityY) {
    // 从对象池获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      bullet.setVelocity(velocityX, velocityY);
      
      this.bulletsFired++;
      this.activeBullets++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.enable = false;
    bullet.setVelocity(0, 0);
    
    this.activeBullets--;
  }

  updateStatusText() {
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`,
      '',
      'Press WASD to fire bullets'
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