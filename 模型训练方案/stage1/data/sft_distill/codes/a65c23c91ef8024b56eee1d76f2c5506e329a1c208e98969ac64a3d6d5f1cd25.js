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
    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 创建 WASD 键盘输入
    this.keys = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 添加文本显示发射的子弹数量
    this.bulletText = this.add.text(16, 16, 'Bullets Fired: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(16, 50, 'Press WASD to fire bullets', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    // 检测 WASD 键按下并发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
      this.fireBullet(400, 300, 0, -300); // 向上
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
      this.fireBullet(400, 300, -300, 0); // 向左
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
      this.fireBullet(400, 300, 0, 300); // 向下
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
      this.fireBullet(400, 300, 300, 0); // 向右
    }

    // 检查子弹是否离开边界，离开则回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 50 || 
            bullet.x > bounds.x + bounds.width + 50 ||
            bullet.y < bounds.y - 50 || 
            bullet.y > bounds.y + bounds.height + 50) {
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);
        }
      }
    });
  }

  fireBullet(x, y, velocityX, velocityY) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度
      bullet.body.setVelocity(velocityX, velocityY);
      
      // 更新发射计数
      this.bulletsFired++;
      this.bulletText.setText('Bullets Fired: ' + this.bulletsFired);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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