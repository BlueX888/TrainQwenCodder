class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.activeBullets = 0; // 当前活跃子弹数
  }

  preload() {
    // 创建红色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8); // 绘制直径16的圆形子弹
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 监听世界边界碰撞事件
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject && body.gameObject.active) {
        this.recycleBullet(body.gameObject);
      }
    });

    // 创建WASD键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 创建发射源（屏幕中心的绿色方块）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(392, 292, 16, 16);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 检测WASD按键并发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.keyW)) {
      this.fireBullet(0, -1); // 向上
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyA)) {
      this.fireBullet(-1, 0); // 向左
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyS)) {
      this.fireBullet(0, 1); // 向下
    }
    if (Phaser.Input.Keyboard.JustDown(this.keyD)) {
      this.fireBullet(1, 0); // 向右
    }

    this.updateStatusText();
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(400, 300);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 启用物理体和世界边界碰撞检测
      bullet.body.enable = true;
      bullet.body.onWorldBounds = true;
      bullet.body.setCollideWorldBounds(true);
      
      // 设置子弹速度（速度160）
      bullet.body.setVelocity(dirX * 160, dirY * 160);
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    bullet.body.enable = false;
    
    // 更新统计
    this.activeBullets--;
  }

  updateStatusText() {
    this.statusText.setText([
      'Press WASD to fire bullets',
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`
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