class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.collisionCount = 0;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x666666, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.health,
      collisionCount: this.collisionCount,
      cameraShaking: false,
      gameState: 'running'
    };

    // 创建更大的世界边界以支持镜头移动
    this.physics.world.setBounds(0, 0, 1600, 600);

    // 创建地面平台
    const platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 25; i++) {
      platforms.create(i * 64 + 32, 568, 'ground');
    }

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(300 + i * 250, 450, 'enemy');
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-50, 50));
    }

    // 物理碰撞设置
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.enemies, platforms);

    // 玩家与敌人碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置镜头追踪玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 600);

    // 创建生命值显示（固定在屏幕左上角）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头上

    // 创建碰撞次数显示
    this.collisionText = this.add.text(16, 50, `Collisions: ${this.collisionCount}`, {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);

    // 创建提示文本
    this.hintText = this.add.text(16, 84, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hintText.setScrollFactor(0);

    // 碰撞冷却时间
    this.collisionCooldown = false;

    console.log(JSON.stringify({
      event: 'game_start',
      health: this.health,
      playerPosition: { x: this.player.x, y: this.player.y }
    }));
  }

  handleCollision(player, enemy) {
    // 防止频繁碰撞
    if (this.collisionCooldown) return;

    this.collisionCooldown = true;
    this.collisionCount++;

    // 扣减生命值
    this.health = Math.max(0, this.health - 10);

    // 更新UI
    this.healthText.setText(`Health: ${this.health}`);
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 触发镜头震动 4 秒
    this.cameras.main.shake(4000, 0.01);
    
    // 更新信号
    window.__signals__.health = this.health;
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.cameraShaking = true;

    // 输出碰撞日志
    console.log(JSON.stringify({
      event: 'collision',
      health: this.health,
      collisionCount: this.collisionCount,
      timestamp: Date.now()
    }));

    // 敌人反弹效果
    const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
    enemy.setVelocity(
      Math.cos(angle) * 200,
      Math.sin(angle) * 200
    );

    // 玩家受击反馈
    player.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      player.clearTint();
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }

    // 4秒后重置震动状态和碰撞冷却
    this.time.delayedCall(4000, () => {
      window.__signals__.cameraShaking = false;
    });

    // 1秒碰撞冷却
    this.time.delayedCall(1000, () => {
      this.collisionCooldown = false;
    });
  }

  gameOver() {
    window.__signals__.gameState = 'gameover';
    
    console.log(JSON.stringify({
      event: 'game_over',
      finalHealth: this.health,
      totalCollisions: this.collisionCount,
      timestamp: Date.now()
    }));

    // 显示游戏结束文本
    const gameOverText = this.add.text(
      this.cameras.main.worldView.x + 400,
      this.cameras.main.worldView.y + 300,
      'GAME OVER\nPress R to Restart',
      {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 按R重启
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  update() {
    if (this.health <= 0) return;

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 更新信号中的玩家位置
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);