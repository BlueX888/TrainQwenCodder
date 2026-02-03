class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
  }

  preload() {
    // 使用 Graphics 生成白色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建物理对象池（Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 创建玩家（用于发射子弹的中心点）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(400, 300, 'player');

    // 设置 WASD 键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加按键按下事件监听
    this.keyW.on('down', () => this.fireBullet(0, -1)); // 向上
    this.keyA.on('down', () => this.fireBullet(-1, 0)); // 向左
    this.keyS.on('down', () => this.fireBullet(0, 1));  // 向下
    this.keyD.on('down', () => this.fireBullet(1, 0));  // 向右

    // 显示状态信息
    this.statusText = this.add.text(10, 10, 'Bullets Fired: 0', {
      fontSize: '18px',
      fill: '#ffffff'
    });
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取子弹（如果池中没有可用对象，会自动创建）
    const bullet = this.bullets.get(this.player.x, this.player.y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（速度 300）
      bullet.body.setVelocity(dirX * 300, dirY * 300);

      // 更新发射计数
      this.bulletsFired++;
      this.statusText.setText(`Bullets Fired: ${this.bulletsFired}`);
    }
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active) {
        // 检测子弹是否离开边界
        if (
          bullet.x < -20 ||
          bullet.x > 820 ||
          bullet.y < -20 ||
          bullet.y > 620
        ) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.setVelocity(0, 0);
        }
      }
    });
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