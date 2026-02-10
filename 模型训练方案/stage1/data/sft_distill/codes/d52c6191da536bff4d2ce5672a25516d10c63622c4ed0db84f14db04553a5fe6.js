class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.playerRotationSpeed = 3; // 旋转速度（度/帧）
    this.bulletSpeed = 160; // 子弹速度
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示朝向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20); // 顶点（指向上方）
    playerGraphics.lineTo(-15, 15); // 左下角
    playerGraphics.lineTo(15, 15); // 右下角
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 35);
    playerGraphics.destroy();

    // 创建子弹纹理（圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.99);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30,
      runChildUpdate: true
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止空格键连续触发
    this.canShoot = true;
    this.shootCooldown = 250; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, 'Arrow Keys: Rotate | Space: Shoot', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= this.playerRotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.angle += this.playerRotationSpeed;
    }

    // 射击控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shoot();
      this.canShoot = false;
      
      // 冷却时间
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }

    // 更新子弹（检查边界）
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 子弹超出屏幕边界则销毁
        if (bullet.x < -10 || bullet.x > 810 || 
            bullet.y < -10 || bullet.y > 610) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Player Angle: ${Math.round(this.player.angle)}°`,
      `Active Bullets: ${this.bullets.countActive(true)}`
    ]);
  }

  shoot() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 将角度转换为弧度
      const angleRad = Phaser.Math.DegToRad(this.player.angle - 90);
      
      // 计算子弹初始位置（从玩家前方发射）
      const offsetX = Math.cos(angleRad) * 20;
      const offsetY = Math.sin(angleRad) * 20;
      bullet.setPosition(this.player.x + offsetX, this.player.y + offsetY);
      
      // 根据角度设置子弹速度
      const velocityX = Math.cos(angleRad) * this.bulletSpeed;
      const velocityY = Math.sin(angleRad) * this.bulletSpeed;
      bullet.setVelocity(velocityX, velocityY);
      
      // 子弹旋转与发射方向一致
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
  scene: GameScene
};

const game = new Phaser.Game(config);