class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建蓝色子弹纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillCircle(8, 8, 8); // 半径8的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建子弹对象池（使用 Arcade Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 启用右键菜单禁用（可选，避免浏览器右键菜单干扰）
    this.input.mouse.disableContextMenu();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 300, '右键点击发射蓝色子弹', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  fireBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);

    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算发射方向（向右发射）
      // 这里简单设置为向右，也可以根据鼠标位置计算方向
      const angle = 0; // 向右
      const velocity = this.physics.velocityFromAngle(angle, 200);
      
      bullet.setVelocity(velocity.x, velocity.y);

      // 更新状态
      this.bulletsFired++;
      this.activeBullets = this.bullets.countActive(true);
      this.updateStatusText();
    }
  }

  update(time, delta) {
    // 检查子弹是否离开边界，如果是则回收到对象池
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检查是否超出游戏边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          // 回收子弹到对象池
          this.bullets.killAndHide(bullet);
          bullet.setVelocity(0, 0);
          
          // 更新活跃子弹数
          this.activeBullets = this.bullets.countActive(true);
          this.updateStatusText();
        }
      }
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `已发射子弹: ${this.bulletsFired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池容量: ${this.bullets.getLength()}/${this.bullets.maxSize}`
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