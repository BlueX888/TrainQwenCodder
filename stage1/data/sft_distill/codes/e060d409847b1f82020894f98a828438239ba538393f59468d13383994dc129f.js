class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 状态信号：生命值
    this.isInvincible = false; // 无敌状态
    this.hitCount = 0; // 受击次数统计
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    this.createPlayerTexture();
    this.createEnemyTexture();
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x222222, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建玩家（绿色）
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(30, 30);

    // 创建多个敌人（红色）
    this.enemies = this.physics.add.group();
    
    // 创建固定位置的敌人用于测试
    const enemy1 = this.enemies.create(200, 300, 'enemyTex');
    enemy1.setVelocity(50, 0);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 300, 'enemyTex');
    enemy2.setVelocity(-50, 0);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 150, 'enemyTex');
    enemy3.setVelocity(0, 50);
    enemy3.setBounce(1);
    enemy3.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.hitCountText = this.add.text(16, 48, `Hit Count: ${this.hitCount}`, {
      fontSize: '20px',
      fill: '#ff0'
    });

    this.statusText = this.add.text(16, 80, 'Status: Normal', {
      fontSize: '20px',
      fill: '#0f0'
    });

    // 提示信息
    this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#888'
    }).setOrigin(0.5);
  }

  update() {
    // 玩家移动控制
    if (!this.isInvincible) {
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-200);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
      }
    }
  }

  handleHit(player, enemy) {
    // 如果正在无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.health--;
    this.hitCount++;
    this.healthText.setText(`Health: ${this.health}`);
    this.hitCountText.setText(`Hit Count: ${this.hitCount}`);

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: Game Over!');
      this.statusText.setColor('#f00');
      this.scene.pause();
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: Invincible!');
    this.statusText.setColor('#ff0');

    // 计算击退方向（从敌人到玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离与速度 120 相关（120 像素）
    const knockbackDistance = 120;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 目标位置
    const targetX = player.x + knockbackX;
    const targetY = player.y + knockbackY;

    // 确保不超出边界
    const finalX = Phaser.Math.Clamp(targetX, 20, 780);
    const finalY = Phaser.Math.Clamp(targetY, 20, 580);

    // 停止玩家当前速度
    player.setVelocity(0);

    // 击退效果 Tween（0.3秒完成击退）
    this.tweens.add({
      targets: player,
      x: finalX,
      y: finalY,
      duration: 300,
      ease: 'Power2'
    });

    // 闪烁效果（1秒内闪烁）
    this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，加上初始共10次，总计1秒
      onComplete: () => {
        player.alpha = 1;
        this.isInvincible = false;
        this.statusText.setText('Status: Normal');
        this.statusText.setColor('#0f0');
      }
    });
  }

  createPlayerTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 绘制绿色圆形角色
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(20, 20, 15);
    
    // 添加眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 15, 3);
    graphics.fillCircle(25, 15, 3);
    
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();
  }

  createEnemyTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 绘制红色方形敌人
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(5, 5, 30, 30);
    
    // 添加尖刺效果
    graphics.fillStyle(0xaa0000, 1);
    graphics.fillTriangle(20, 5, 15, 0, 25, 0);
    graphics.fillTriangle(20, 35, 15, 40, 25, 40);
    graphics.fillTriangle(5, 20, 0, 15, 0, 25);
    graphics.fillTriangle(35, 20, 40, 15, 40, 25);
    
    graphics.generateTexture('enemyTex', 40, 40);
    graphics.destroy();
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