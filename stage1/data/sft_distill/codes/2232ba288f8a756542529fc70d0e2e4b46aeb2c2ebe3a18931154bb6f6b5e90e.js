class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0;  // 状态信号：已发射子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建粉色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(8, 8, 8); // 半径 8 的圆形
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建子弹对象池（Physics Group）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false,
      createCallback: (bullet) => {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键（button === 0）
      if (pointer.leftButtonDown()) {
        this.fireBullet(pointer.x, pointer.y);
      }
    });

    // 添加文本显示状态信息
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 300, 'Click to Fire Pink Bullets!', {
      fontSize: '24px',
      fill: '#FF69B4',
      align: 'center'
    }).setOrigin(0.5);
  }

  fireBullet(x, y) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(x, y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向右发射）
      bullet.body.setVelocity(120, 0);
      
      // 更新状态信号
      this.bulletsFired++;
      this.activeBullets = this.bullets.countActive(true);
      
      console.log(`Bullet fired! Total: ${this.bulletsFired}, Active: ${this.activeBullets}`);
    }
  }

  update(time, delta) {
    // 检查所有活跃子弹
    this.bullets.children.entries.forEach((bullet) => {
      if (bullet.active) {
        // 检测是否超出边界
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          // 回收到对象池
          this.bullets.killAndHide(bullet);
          bullet.body.reset(0, 0);
          
          // 更新活跃子弹数
          this.activeBullets = this.bullets.countActive(true);
        }
      }
    });

    // 更新状态显示
    this.statsText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`
    ]);
  }
}

// Phaser 游戏配置
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