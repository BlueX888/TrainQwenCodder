class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态：发射的子弹数量
    this.activeBullets = 0; // 可验证状态：当前活跃子弹数
  }

  preload() {
    // 创建粉色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建玩家（用于发射起点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FF00, 1);
    playerGraphics.fillRect(-20, -20, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30, // 对象池最大容量
      runChildUpdate: true // 允许子弹运行 update 方法
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加冷却时间控制
    this.lastFired = 0;
    this.fireRate = 200; // 发射间隔（毫秒）

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(400, 50, '按空格键发射粉色子弹', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 80, '子弹离开边界会自动回收', {
      fontSize: '16px',
      fill: '#aaaaaa'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 检测空格键按下并发射子弹
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 检查并回收离开边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检测子弹是否离开屏幕边界
        if (bullet.y < -20 || bullet.y > this.cameras.main.height + 20 ||
            bullet.x < -20 || bullet.x > this.cameras.main.width + 20) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.stop();
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bullets.getLength()}`,
      `可用子弹: ${this.bullets.getTotalFree()}`
    ]);
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -200;
      bullet.body.velocity.x = 0;
      
      // 更新状态
      this.bulletsFired++;
      this.activeBullets++;
      
      console.log(`发射子弹 #${this.bulletsFired}, 当前活跃: ${this.activeBullets}`);
    } else {
      console.log('对象池已满，无法发射更多子弹');
    }
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);