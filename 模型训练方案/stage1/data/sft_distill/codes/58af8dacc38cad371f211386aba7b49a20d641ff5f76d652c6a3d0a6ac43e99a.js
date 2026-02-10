class ShootingScene extends Phaser.Scene {
  constructor() {
    super('ShootingScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.rotationSpeed = 3; // 旋转速度（度/帧）
    this.bulletSpeed = 240; // 子弹速度
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0); // 尖端指向右侧
    playerGraphics.lineTo(-10, -15);
    playerGraphics.lineTo(-10, 15);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: false
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 防止空格键重复触发
    this.canShoot = true;

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文本
    this.add.text(10, 560, '方向键旋转 | 空格键射击', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= this.rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.rotationSpeed;
    }

    // 射击控制（按下空格键）
    if (this.spaceKey.isDown && this.canShoot) {
      this.shootBullet();
      this.canShoot = false;
    }

    // 释放空格键后允许再次射击
    if (this.spaceKey.isUp) {
      this.canShoot = true;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -20 || bullet.x > 820 || 
            bullet.y < -20 || bullet.y > 620) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `子弹发射数: ${this.bulletsFired}\n` +
      `当前角度: ${Math.round(this.player.angle)}°\n` +
      `活跃子弹: ${this.bullets.countActive(true)}`
    );
  }

  shootBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 将玩家角度转换为弧度
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      
      // 计算子弹速度向量
      const velocityX = Math.cos(angleRad) * this.bulletSpeed;
      const velocityY = Math.sin(angleRad) * this.bulletSpeed;
      
      // 设置子弹速度
      bullet.setVelocity(velocityX, velocityY);
      
      // 设置子弹角度（可选，使子弹视觉上与运动方向一致）
      bullet.setRotation(angleRad);
      
      // 增加发射计数
      this.bulletsFired++;
    }
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
  scene: ShootingScene
};

new Phaser.Game(config);