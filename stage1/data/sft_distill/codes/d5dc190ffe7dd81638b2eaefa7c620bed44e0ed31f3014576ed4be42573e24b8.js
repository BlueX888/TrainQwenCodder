class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证的状态信号
    this.activeBullets = 0; // 当前激活的子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0088ff, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（使用物理组）
    this.bulletGroup = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 300, '右键点击发射子弹', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  fireBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bulletGroup.get(x, y);

    if (bullet) {
      // 激活子弹
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向右发射）
      bullet.body.setVelocity(200, 0);
      
      // 更新计数器
      this.bulletsFired++;
      this.activeBullets++;
      
      this.updateStatusText();
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
    
    this.activeBullets--;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `发射子弹数: ${this.bulletsFired}`,
      `激活子弹数: ${this.activeBullets}`,
      `对象池容量: ${this.bulletGroup.getLength()}`
    ]);
  }

  update(time, delta) {
    // 检查所有激活的子弹
    this.bulletGroup.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否离开边界
        if (bullet.x < -50 || bullet.x > this.scale.width + 50 ||
            bullet.y < -50 || bullet.y > this.scale.height + 50) {
          this.recycleBullet(bullet);
        }
      }
    });
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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
new Phaser.Game(config);