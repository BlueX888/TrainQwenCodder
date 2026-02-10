class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isShaking = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // 设置世界边界（更大的游戏世界）
    this.physics.world.setBounds(0, 0, 1600, 600);

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 在不同位置创建多个敌人
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(300 + i * 250, 200 + Math.random() * 200, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
    }

    // 创建地面平台
    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 25; i++) {
      this.platforms.create(i * 64 + 32, 568, 'ground');
    }

    // 添加物理碰撞
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // 玩家与敌人碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 设置摄像机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 600);

    // 创建生命值显示（固定在摄像机上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在摄像机视图

    // 创建震动状态提示
    this.shakeText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ff0000',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.shakeText.setScrollFactor(0);

    // 创建控制提示
    this.add.text(16, 550, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  handleCollision(player, enemy) {
    // 避免重复触发（在震动期间忽略碰撞）
    if (this.isShaking) {
      return;
    }

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) this.health = 0;

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发摄像机震动 1.5 秒（1500 毫秒）
    this.cameras.main.shake(1500, 0.01);
    
    // 设置震动状态
    this.isShaking = true;
    this.shakeText.setText('Camera Shaking!');

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 7
    });

    // 1.5秒后重置震动状态
    this.time.delayedCall(1500, () => {
      this.isShaking = false;
      this.shakeText.setText('');
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'GAME OVER\nClick to Restart',
      {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 敌人边界反弹
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.body.velocity.x === 0) {
        enemy.setVelocityX(Phaser.Math.Between(-100, 100));
      }
      if (enemy.body.velocity.y === 0) {
        enemy.setVelocityY(Phaser.Math.Between(-100, 100));
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
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