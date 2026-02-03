class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态：发射子弹计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（灰色）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x808080, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, height - 30, 'Press Arrow Keys to shoot bullets', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    console.log('Game initialized. Bullets fired:', this.bulletsFired);
  }

  update(time, delta) {
    // 更新统计信息
    this.statsText.setText(`Bullets Fired: ${this.bulletsFired}\nActive Bullets: ${this.bullets.countActive()}`);

    // 检测方向键按下并发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.shootBullet(0, -1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.shootBullet(0, 1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.shootBullet(-1, 0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.shootBullet(1, 0);
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const { width, height } = this.cameras.main;
        if (bullet.x < -10 || bullet.x > width + 10 || 
            bullet.y < -10 || bullet.y > height + 10) {
          this.recycleBullet(bullet);
        }
      }
    });
  }

  shootBullet(dirX, dirY) {
    // 从对象池获取子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（速度80）
      bullet.body.velocity.x = dirX * 80;
      bullet.body.velocity.y = dirY * 80;
      
      // 增加发射计数
      this.bulletsFired++;
      
      console.log(`Bullet fired! Direction: (${dirX}, ${dirY}), Total: ${this.bulletsFired}`);
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.set(0, 0);
    
    console.log('Bullet recycled. Active bullets:', this.bullets.countActive());
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