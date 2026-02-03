class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isShaking = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建背景网格以便观察相机移动
    this.createBackground();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocity(100, 50);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置世界边界（更大的世界以便相机跟随）
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // 相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 1200);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.handleCollision, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建生命值显示文本（固定在相机视口）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在相机视口，不随相机移动

    // 创建状态提示文本
    this.statusText = this.add.text(16, 56, 'Use arrow keys to move', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);

    // 碰撞冷却时间
    this.collisionCooldown = 0;
  }

  createBackground() {
    // 创建网格背景以便观察相机移动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 1600; x += 100) {
      graphics.lineBetween(x, 0, x, 1200);
    }

    // 绘制水平线
    for (let y = 0; y <= 1200; y += 100) {
      graphics.lineBetween(0, y, 1600, y);
    }

    // 添加坐标标记
    for (let x = 0; x <= 1600; x += 200) {
      for (let y = 0; y <= 1200; y += 200) {
        const text = this.add.text(x + 5, y + 5, `${x},${y}`, {
          fontSize: '12px',
          fill: '#666666'
        });
      }
    }
  }

  handleCollision(player, enemy) {
    // 碰撞冷却检查（避免连续触发）
    if (this.collisionCooldown > 0) {
      return;
    }

    // 扣减生命值
    this.health -= 10;
    this.health = Math.max(0, this.health); // 确保不低于0

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);

    // 触发相机震动（持续500毫秒，强度0.01）
    this.cameras.main.shake(500, 0.01);
    this.isShaking = true;

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        player.alpha = 1;
      }
    });

    // 更新状态文本
    this.statusText.setText('Collision! Camera Shaking!');
    this.statusText.setStyle({ fill: '#ff0000' });

    // 设置碰撞冷却时间
    this.collisionCooldown = 1000; // 1秒冷却

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Game Over! Health depleted!');
      this.statusText.setStyle({ fill: '#ff0000', fontSize: '24px' });
      this.physics.pause();
      this.player.setTint(0x888888);
    }

    // 监听震动完成事件
    this.cameras.main.once('camerashakecomplete', () => {
      this.isShaking = false;
      if (this.health > 0) {
        this.statusText.setText('Use arrow keys to move');
        this.statusText.setStyle({ fill: '#ffff00', fontSize: '18px' });
      }
    });
  }

  update(time, delta) {
    // 更新碰撞冷却时间
    if (this.collisionCooldown > 0) {
      this.collisionCooldown -= delta;
    }

    // 如果游戏结束，不处理输入
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 显示当前相机震动状态（用于验证）
    if (this.isShaking) {
      // 震动时可以添加额外的视觉反馈
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

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    health: scene.health,
    isShaking: scene.isShaking,
    playerPosition: {
      x: scene.player.x,
      y: scene.player.y
    },
    enemyPosition: {
      x: scene.enemy.x,
      y: scene.enemy.y
    }
  };
};