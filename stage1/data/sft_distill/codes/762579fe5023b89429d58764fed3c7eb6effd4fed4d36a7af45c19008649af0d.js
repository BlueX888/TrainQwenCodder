class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：已发射子弹数
    this.activeBullets = 0; // 状态信号：当前存活子弹数
  }

  preload() {
    // 创建玩家纹理（三角形，指示朝向）
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.beginPath();
    graphics.moveTo(20, 0);
    graphics.lineTo(-10, -10);
    graphics.lineTo(-10, 10);
    graphics.closePath();
    graphics.fillPath();
    graphics.generateTexture('player', 30, 20);
    graphics.destroy();

    // 创建子弹纹理（小圆点）
    const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(0, 0, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
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
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止空格键连发
    this.canFire = true;
    this.spaceKey.on('down', () => {
      if (this.canFire) {
        this.fireBullet();
        this.canFire = false;
      }
    });
    
    this.spaceKey.on('up', () => {
      this.canFire = true;
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 550, 'Arrow Keys: Rotate | Space: Fire', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  fireBullet() {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 根据玩家角度计算子弹速度
      const angle = this.player.rotation;
      const speed = 200;
      
      // 使用 velocityFromAngle 计算速度向量
      const velocity = this.physics.velocityFromRotation(angle, speed);
      bullet.setVelocity(velocity.x, velocity.y);
      
      // 设置子弹角度与玩家一致
      bullet.setRotation(angle);
      
      // 子弹离开屏幕后销毁
      bullet.update = function() {
        if (this.x < -50 || this.x > 850 || this.y < -50 || this.y > 650) {
          this.setActive(false);
          this.setVisible(false);
        }
      };
      
      // 更新状态
      this.bulletsFired++;
      this.updateActiveBullets();
    }
  }

  updateActiveBullets() {
    // 计算当前存活的子弹数
    this.activeBullets = this.bullets.getChildren().filter(
      bullet => bullet.active
    ).length;
  }

  update(time, delta) {
    // 玩家旋转控制
    const rotationSpeed = 0.05;
    
    if (this.cursors.left.isDown) {
      this.player.rotation -= rotationSpeed;
    } else if (this.cursors.right.isDown) {
      this.player.rotation += rotationSpeed;
    }

    // 可选：玩家移动（按上下键）
    if (this.cursors.up.isDown) {
      const velocity = this.physics.velocityFromRotation(this.player.rotation, 150);
      this.player.setVelocity(velocity.x, velocity.y);
    } else if (this.cursors.down.isDown) {
      const velocity = this.physics.velocityFromRotation(this.player.rotation, -100);
      this.player.setVelocity(velocity.x, velocity.y);
    }

    // 更新状态显示
    this.updateActiveBullets();
    this.statusText.setText([
      `Bullets Fired: ${this.bulletsFired}`,
      `Active Bullets: ${this.activeBullets}`,
      `Player Angle: ${Math.round(Phaser.Math.RadToDeg(this.player.rotation))}°`
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);