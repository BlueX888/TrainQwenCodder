class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数量
    this.activeBullets = 0; // 状态信号：当前活跃子弹数量
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（蓝色矩形飞船）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 30);
    playerGraphics.generateTexture('player', 40, 30);
    playerGraphics.destroy();

    // 创建子弹纹理（粉色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xff1493, 1); // 粉色
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 100, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加冷却时间控制
    this.lastFired = 0;
    this.fireRate = 200; // 发射间隔（毫秒）

    // 添加显示文本
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(width / 2, 50, '按空格键发射子弹', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.updateStatsText();
  }

  update(time, delta) {
    // 更新统计文本
    this.updateStatsText();

    // 检测空格键按下（带冷却时间）
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && (bullet.y < -20 || bullet.y > this.cameras.main.height + 20)) {
        this.recycleBullet(bullet);
      }
    });
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射，速度200）
      bullet.body.velocity.y = -200;
      bullet.body.velocity.x = 0;
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      
      console.log(`子弹发射！总计: ${this.bulletsFired}, 活跃: ${this.activeBullets}`);
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.y = 0;
    bullet.body.velocity.x = 0;
    
    this.activeBullets--;
    
    console.log(`子弹回收！活跃: ${this.activeBullets}`);
  }

  updateStatsText() {
    this.statsText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bullets.getLength()}`,
      `对象池已用: ${this.bullets.countActive(true)}`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000033',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);