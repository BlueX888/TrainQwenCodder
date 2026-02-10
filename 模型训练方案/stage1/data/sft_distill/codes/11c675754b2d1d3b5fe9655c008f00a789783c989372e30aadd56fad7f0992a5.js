// 完整的 Phaser3 代码 - 空格键发射子弹示例
class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsfired = 0; // 可验证状态信号：已发射子弹数
    this.activeBullets = 0; // 可验证状态信号：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建红色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(8, 8, 8);
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();

    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30, // 对象池最大容量
      runChildUpdate: false
    });

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 添加冷却时间控制
    this.lastFired = 0;
    this.fireRate = 200; // 发射间隔（毫秒）

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 50, '按空格键发射子弹', {
      fontSize: '24px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    // 检测空格键按下并发射子弹
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 检查子弹是否离开边界，离开则回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检测是否超出屏幕边界
        if (bullet.y < -20 || bullet.y > 620 || 
            bullet.x < -20 || bullet.x > 820) {
          this.recycleBullet(bullet);
        }
      }
    });

    this.updateStatusText();
  }

  fireBullet() {
    // 从对象池获取子弹
    let bullet = this.bullets.get(this.player.x, this.player.y - 30);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（向上发射）
      bullet.body.velocity.y = -240;
      bullet.body.velocity.x = 0;
      
      // 更新状态
      this.bulletsired++;
      this.activeBullets++;
      
      console.log(`发射子弹 #${this.bulletsired}`);
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.velocity.y = 0;
    bullet.body.velocity.x = 0;
    
    this.activeBullets--;
    
    console.log('子弹已回收到对象池');
  }

  updateStatusText() {
    this.statusText.setText([
      `已发射子弹: ${this.bulletsired}`,
      `活跃子弹: ${this.activeBullets}`,
      `对象池大小: ${this.bullets.getLength()}`,
      `对象池使用: ${this.bullets.countActive(true)}/${this.bullets.maxSize}`
    ]);
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
  scene: BulletScene
};

// 创建游戏实例
new Phaser.Game(config);