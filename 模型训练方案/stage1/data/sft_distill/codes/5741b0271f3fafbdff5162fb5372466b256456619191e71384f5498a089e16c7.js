class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃的子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillCircle(8, 8, 8); // 半径为8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建物理组作为子弹对象池
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

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
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

  fireBullet(targetX, targetY) {
    // 从对象池获取子弹
    const bullet = this.bulletGroup.get(400, 300);
    
    if (!bullet) {
      return; // 对象池已满
    }

    // 激活子弹
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setPosition(400, 300); // 从屏幕中心发射

    // 计算发射方向
    const angle = Phaser.Math.Angle.Between(400, 300, targetX, targetY);
    
    // 设置子弹速度（速度为200）
    const velocityX = Math.cos(angle) * 200;
    const velocityY = Math.sin(angle) * 200;
    bullet.setVelocity(velocityX, velocityY);

    // 更新状态
    this.bulletsFired++;
    this.activeBullets++;
    this.updateStatusText();
  }

  update(time, delta) {
    // 检查所有活跃的子弹
    const bullets = this.bulletGroup.getChildren();
    
    bullets.forEach((bullet) => {
      if (bullet.active) {
        // 检查子弹是否超出边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          // 回收子弹到对象池
          this.recycleBullet(bullet);
        }
      }
    });
  }

  recycleBullet(bullet) {
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);
    
    // 更新状态
    this.activeBullets--;
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText(
      `发射总数: ${this.bulletsFired}\n` +
      `活跃子弹: ${this.activeBullets}\n` +
      `对象池大小: ${this.bulletGroup.getLength()}`
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

// 创建游戏实例
new Phaser.Game(config);