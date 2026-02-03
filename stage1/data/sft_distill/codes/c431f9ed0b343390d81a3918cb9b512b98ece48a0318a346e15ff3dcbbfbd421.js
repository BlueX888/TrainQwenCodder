class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 验证信号：发射的子弹总数
    this.activeBullets = 0; // 验证信号：当前活跃子弹数
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（三角形表示方向）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(20, 0);
    playerGraphics.lineTo(-10, -10);
    playerGraphics.lineTo(-10, 10);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 20);
    playerGraphics.destroy();

    // 创建子弹纹理（小圆点）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50,
      runChildUpdate: true
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 鼠标右键输入
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.fireBullet();
      }
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文字
    this.add.text(10, 550, '左右方向键旋转 | 鼠标右键射击', {
      fontSize: '14px',
      fill: '#ffffff'
    });
  }

  update(time, delta) {
    // 玩家旋转控制
    if (this.cursors.left.isDown) {
      this.player.angle -= 3;
    } else if (this.cursors.right.isDown) {
      this.player.angle += 3;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < -50 || bullet.x > 850 || 
            bullet.y < -50 || bullet.y > 650) {
          bullet.setActive(false);
          bullet.setVisible(false);
          this.activeBullets--;
        }
      }
    });

    // 更新状态显示
    this.statusText.setText([
      `子弹发射总数: ${this.bulletsFired}`,
      `当前活跃子弹: ${this.activeBullets}`,
      `玩家角度: ${Math.round(this.player.angle)}°`
    ]);
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家角度设置子弹速度
      // Phaser 的角度是顺时针的，0度指向右侧
      const velocityVector = this.physics.velocityFromAngle(
        this.player.angle, 
        300
      );
      
      bullet.setVelocity(velocityVector.x, velocityVector.y);
      bullet.setRotation(Phaser.Math.DegToRad(this.player.angle));
      
      // 更新统计
      this.bulletsFired++;
      this.activeBullets++;
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

new Phaser.Game(config);