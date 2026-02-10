class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（蓝色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x0000ff, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 100, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池（使用 Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20, // 对象池最大容量
      runChildUpdate: true // 允许子弹运行 update 方法
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 添加说明文本
    this.add.text(10, 10, '按空格键发射子弹', {
      fontSize: '18px',
      color: '#ffffff'
    });

    // 显示状态信息
    this.statsText = this.add.text(10, 40, '', {
      fontSize: '16px',
      color: '#ffff00'
    });

    this.updateStatsText();
  }

  update(time, delta) {
    // 检测空格键按下（使用 JustDown 避免连续触发）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 检查子弹是否离开边界
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        const bounds = this.cameras.main;
        
        // 检查是否超出边界
        if (
          bullet.y < -bullet.height ||
          bullet.y > bounds.height + bullet.height ||
          bullet.x < -bullet.width ||
          bullet.x > bounds.width + bullet.width
        ) {
          // 回收到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.enable = false;
          this.activeBullets--;
          this.updateStatsText();
        }
      }
    });
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;

      // 设置子弹速度（向上发射）
      bullet.setVelocityY(-160);
      bullet.setVelocityX(0);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateStatsText();

      console.log(`子弹发射! 总发射数: ${this.bulletsFired}, 活跃数: ${this.activeBullets}`);
    } else {
      console.log('对象池已满，无法发射更多子弹');
    }
  }

  updateStatsText() {
    this.statsText.setText(
      `发射总数: ${this.bulletsFired} | 活跃子弹: ${this.activeBullets} | 池容量: ${this.bullets.maxSize}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);