class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号：发射的子弹总数
    this.activeBullets = 0; // 可验证状态信号：当前活跃的子弹数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家飞船纹理（绿色三角形）
    const shipGraphics = this.add.graphics();
    shipGraphics.fillStyle(0x00ff00, 1);
    shipGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    shipGraphics.generateTexture('ship', 32, 32);
    shipGraphics.destroy();

    // 创建蓝色子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0x0000ff, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家飞船
    this.player = this.physics.add.sprite(400, 500, 'ship');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加冷却时间控制
    this.lastFired = 0;
    this.fireRate = 200; // 发射间隔（毫秒）

    // 添加左右移动控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 检测空格键发射子弹（带冷却时间）
    if (this.spaceKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }

    // 检查子弹是否离开边界，离开则回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查是否离开屏幕边界
        if (bullet.y < -10 || bullet.y > 610 || 
            bullet.x < -10 || bullet.x > 810) {
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateStatusText();
  }

  fireBullet() {
    // 从对象池获取子弹（如果池中没有可用对象，会自动创建新的）
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -160;
      bullet.body.velocity.x = 0;
      
      // 更新统计信息
      this.bulletsFired++;
      this.activeBullets++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.y = 0;
    bullet.body.velocity.x = 0;
    
    // 更新活跃子弹计数
    this.activeBullets--;
  }

  updateStatusText() {
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`,
      '',
      'Controls:',
      'SPACE - Fire',
      'LEFT/RIGHT - Move'
    ]);
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