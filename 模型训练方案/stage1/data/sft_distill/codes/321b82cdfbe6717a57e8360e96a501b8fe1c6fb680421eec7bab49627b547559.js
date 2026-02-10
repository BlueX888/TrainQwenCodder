class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 使用Graphics创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建子弹对象池（使用Physics Group）
    this.bulletPool = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: true // 允许子弹运行update
    });

    // 玩家位置（屏幕中心）
    this.playerX = 400;
    this.playerY = 300;

    // 绘制玩家（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(-16, -16, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player = this.add.sprite(this.playerX, this.playerY, 'player');

    // 设置WASD按键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 添加按键事件监听（按下时发射子弹）
    this.keyW.on('down', () => this.fireBullet(0, -1)); // 向上
    this.keyA.on('down', () => this.fireBullet(-1, 0)); // 向左
    this.keyS.on('down', () => this.fireBullet(0, 1));  // 向下
    this.keyD.on('down', () => this.fireBullet(1, 0));  // 向右

    // 显示信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateInfoText();
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取子弹
    const bullet = this.bulletPool.get(this.playerX, this.playerY);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 设置子弹速度（160像素/秒）
      bullet.body.setVelocity(dirX * 160, dirY * 160);

      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
      this.updateInfoText();
    }
  }

  update() {
    // 检查所有活跃子弹是否离开边界
    const bullets = this.bulletPool.getChildren();

    bullets.forEach(bullet => {
      if (bullet.active) {
        // 检查是否离开屏幕边界
        if (
          bullet.x < -20 || 
          bullet.x > 820 || 
          bullet.y < -20 || 
          bullet.y > 620
        ) {
          // 回收到对象池
          this.bulletPool.killAndHide(bullet);
          bullet.body.setVelocity(0, 0);
          this.activeBullets--;
          this.updateInfoText();
        }
      }
    });
  }

  updateInfoText() {
    this.infoText.setText([
      'Press WASD to fire bullets',
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bulletPool.getLength()}`,
      `Max Pool Size: ${this.bulletPool.maxSize}`
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);