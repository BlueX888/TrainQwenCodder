class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 可验证状态信号
    this.player = null;
    this.bullets = null;
    this.cursors = null;
    this.spaceKey = null;
    this.canShoot = true;
    this.shootCooldown = 250; // 射击冷却时间（毫秒）
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形指示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);  // 尖端朝右
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆形）
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
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 添加说明文字
    this.add.text(10, 550, '左右方向键：旋转 | 空格键：发射子弹', {
      fontSize: '14px',
      fill: '#aaaaaa'
    });

    // 世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText(
      `子弹发射数: ${this.bulletsFired}\n` +
      `当前角度: ${Math.round(this.player.angle)}°\n` +
      `活跃子弹: ${this.bullets.countActive(true)}`
    );

    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 发射子弹
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        const bounds = this.physics.world.bounds;
        if (bullet.x < bounds.x - 20 || bullet.x > bounds.right + 20 ||
            bullet.y < bounds.y - 20 || bullet.y > bounds.bottom + 20) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });
  }

  shootBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 计算发射角度（转换为弧度）
      const angleRad = Phaser.Math.DegToRad(this.player.angle);
      
      // 设置子弹位置（从玩家前方发射）
      const offsetX = Math.cos(angleRad) * 20;
      const offsetY = Math.sin(angleRad) * 20;
      bullet.setPosition(this.player.x + offsetX, this.player.y + offsetY);
      
      // 根据角度设置速度（速度 160）
      const velocityX = Math.cos(angleRad) * 160;
      const velocityY = Math.sin(angleRad) * 160;
      bullet.setVelocity(velocityX, velocityY);
      
      // 设置子弹旋转角度（可选，让子弹朝向移动方向）
      bullet.setRotation(angleRad);
      
      // 更新统计
      this.bulletsFired++;
      
      // 设置射击冷却
      this.canShoot = false;
      this.time.delayedCall(this.shootCooldown, () => {
        this.canShoot = true;
      });
    }
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
  scene: GameScene
};

// 启动游戏
const game = new Phaser.Game(config);