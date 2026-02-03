class BulletScene extends Phaser.Scene {
  constructor() {
    super('BulletScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
    this.activeBullets = 0; // 状态信号：当前活跃的子弹数
  }

  preload() {
    // 使用 Graphics 生成青色子弹纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ffff, 1); // 青色
    graphics.fillCircle(8, 8, 8); // 圆形子弹，半径8
    graphics.generateTexture('bullet', 16, 16);
    graphics.destroy();
  }

  create() {
    // 创建玩家（用于发射子弹的位置参考）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillRect(384, 284, 32, 32);
    
    this.player = {
      x: 400,
      y: 300
    };

    // 创建子弹组（对象池）
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 550, 'Press Arrow Keys to Fire Bullets', {
      fontSize: '14px',
      fill: '#00ffff'
    });

    // 记录上一次按键状态，避免连续发射
    this.lastKeyState = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Pool Size: ${this.bullets.getLength()}`
    ]);

    // 检测方向键按下（边缘触发，避免长按连续发射）
    if (this.cursors.up.isDown && !this.lastKeyState.up) {
      this.fireBullet(0, -1); // 向上
    }
    if (this.cursors.down.isDown && !this.lastKeyState.down) {
      this.fireBullet(0, 1); // 向下
    }
    if (this.cursors.left.isDown && !this.lastKeyState.left) {
      this.fireBullet(-1, 0); // 向左
    }
    if (this.cursors.right.isDown && !this.lastKeyState.right) {
      this.fireBullet(1, 0); // 向右
    }

    // 更新按键状态
    this.lastKeyState.up = this.cursors.up.isDown;
    this.lastKeyState.down = this.cursors.down.isDown;
    this.lastKeyState.left = this.cursors.left.isDown;
    this.lastKeyState.right = this.cursors.right.isDown;

    // 检查子弹是否离开边界，离开则回收
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          this.recycleBullet(bullet);
        }
      }
    });

    // 更新活跃子弹数
    this.activeBullets = this.bullets.countActive(true);
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（速度200）
      bullet.body.setVelocity(dirX * 200, dirY * 200);
      
      // 更新发射计数
      this.bulletsFired++;
    }
  }

  recycleBullet(bullet) {
    // 回收子弹到对象池
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: BulletScene
};

new Phaser.Game(config);