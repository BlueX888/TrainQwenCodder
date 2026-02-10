// MenuScene - 游戏菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);

    // 游戏标题
    const title = this.add.text(width / 2, height / 3, 'COLLECTOR GAME', {
      fontSize: '48px',
      color: '#eee',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 开始提示
    const startText = this.add.text(width / 2, height / 2, 'Click to Start', {
      fontSize: '32px',
      color: '#16c79a'
    });
    startText.setOrigin(0.5);

    // 游戏说明
    const instructions = this.add.text(width / 2, height * 0.65, 'Use Arrow Keys to Move\nCollect Green Circles\nAvoid Red Squares', {
      fontSize: '20px',
      color: '#aaa',
      align: 'center'
    });
    instructions.setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 点击开始游戏
    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

// GameScene - 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.health = 3;
    this.gameOver = false;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理 - 蓝色圆形
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4a90e2, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 收集物纹理 - 绿色圆形
    const collectibleGraphics = this.add.graphics();
    collectibleGraphics.fillStyle(0x16c79a, 1);
    collectibleGraphics.fillCircle(12, 12, 12);
    collectibleGraphics.lineStyle(2, 0xffffff, 1);
    collectibleGraphics.strokeCircle(12, 12, 12);
    collectibleGraphics.generateTexture('collectible', 24, 24);
    collectibleGraphics.destroy();

    // 敌人纹理 - 红色方形
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xe74c3c, 1);
    enemyGraphics.fillRect(0, 0, 24, 24);
    enemyGraphics.lineStyle(2, 0x8b0000, 1);
    enemyGraphics.strokeRect(0, 0, 24, 24);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 重置游戏状态
    this.score = 0;
    this.health = 3;
    this.gameOver = false;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // 创建玩家
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.setScale(1);

    // 创建收集物组
    this.collectibles = this.add.group();
    this.spawnCollectibles();

    // 创建敌人组
    this.enemies = this.add.group();
    this.spawnEnemies();

    // UI文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 }
    });

    this.healthText = this.add.text(16, 50, 'Health: ♥♥♥', {
      fontSize: '24px',
      color: '#e74c3c',
      backgroundColor: '#00000088',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 定时生成收集物
    this.time.addEvent({
      delay: 2000,
      callback: this.spawnCollectibles,
      callbackScope: this,
      loop: true
    });

    // 定时生成敌人
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnEnemies,
      callbackScope: this,
      loop: true
    });
  }

  spawnCollectibles() {
    if (this.gameOver) return;

    const { width, height } = this.cameras.main;
    const count = Phaser.Math.Between(1, 3);

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const collectible = this.add.sprite(x, y, 'collectible');
      this.collectibles.add(collectible);

      // 添加脉冲动画
      this.tweens.add({
        targets: collectible,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  spawnEnemies() {
    if (this.gameOver) return;

    const { width, height } = this.cameras.main;
    const count = Phaser.Math.Between(1, 2);

    for (let i = 0; i < count; i++) {
      const side = Phaser.Math.Between(0, 3);
      let x, y;

      switch (side) {
        case 0: x = Phaser.Math.Between(0, width); y = -20; break;
        case 1: x = width + 20; y = Phaser.Math.Between(0, height); break;
        case 2: x = Phaser.Math.Between(0, width); y = height + 20; break;
        case 3: x = -20; y = Phaser.Math.Between(0, height); break;
      }

      const enemy = this.add.sprite(x, y, 'enemy');
      enemy.speed = Phaser.Math.FloatBetween(1, 2);
      this.enemies.add(enemy);
    }
  }

  update(time, delta) {
    if (this.gameOver) return;

    const speed = 200 * (delta / 1000);

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    } else if (this.cursors.right.isDown) {
      this.player.x += speed;
    }

    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    } else if (this.cursors.down.isDown) {
      this.player.y += speed;
    }

    // 边界限制
    const { width, height } = this.cameras.main;
    this.player.x = Phaser.Math.Clamp(this.player.x, 16, width - 16);
    this.player.y = Phaser.Math.Clamp(this.player.y, 16, height - 16);

    // 检测收集物碰撞
    this.collectibles.children.entries.forEach(collectible => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        collectible.x, collectible.y
      );

      if (distance < 30) {
        this.collectCollectible(collectible);
      }
    });

    // 敌人移动和碰撞检测
    this.enemies.children.entries.forEach(enemy => {
      const angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        this.player.x, this.player.y
      );

      enemy.x += Math.cos(angle) * enemy.speed;
      enemy.y += Math.sin(angle) * enemy.speed;

      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      );

      if (distance < 25) {
        this.hitByEnemy(enemy);
      }

      // 移除超出边界的敌人
      if (enemy.x < -50 || enemy.x > width + 50 || 
          enemy.y < -50 || enemy.y > height + 50) {
        enemy.destroy();
      }
    });
  }

  collectCollectible(collectible) {
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    
    // 收集特效
    this.tweens.add({
      targets: collectible,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => collectible.destroy()
    });
  }

  hitByEnemy(enemy) {
    this.health--;
    this.healthText.setText('Health: ' + '♥'.repeat(this.health));

    // 受伤闪烁
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });

    enemy.destroy();

    if (this.health <= 0) {
      this.endGame();
    }
  }

  endGame() {
    this.gameOver = true;
    
    // 保存分数到 registry
    this.registry.set('finalScore', this.score);
    
    // 延迟跳转到游戏结束场景
    this.time.delayedCall(1000, () => {
      this.scene.start('GameOverScene');
    });
  }
}

// GameOverScene - 游戏结束场景
class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  preload() {
    // 无需预加载
  }

  create() {
    const { width, height } = this.cameras.main;

    // 获取最终分数
    const finalScore = this.registry.get('finalScore') || 0;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // Game Over 标题
    const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '56px',
      color: '#e74c3c',
      fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);

    // 显示分数
    const scoreText = this.add.text(width / 2, height / 2, 'Final Score: ' + finalScore, {
      fontSize: '36px',
      color: '#16c79a'
    });
    scoreText.setOrigin(0.5);

    // 评价文本
    let rating = 'Try Again!';
    if (finalScore >= 100) rating = 'Great Job!';
    if (finalScore >= 200) rating = 'Excellent!';
    if (finalScore >= 300) rating = 'Amazing!';

    const ratingText = this.add.text(width / 2, height / 2 + 50, rating, {
      fontSize: '28px',
      color: '#f39c12'
    });
    ratingText.setOrigin(0.5);

    // 重新开始按钮
    const restartButton = this.add.text(width / 2, height * 0.7, 'Click to Restart', {
      fontSize: '32px',
      color: '#fff',
      backgroundColor: '#27ae60',
      padding: { x: 20, y: 10 }
    });
    restartButton.setOrigin(0.5);
    restartButton.setInteractive({ useHandCursor: true });

    // 按钮悬停效果
    restartButton.on('pointerover', () => {
      restartButton.setScale(1.1);
    });

    restartButton.on('pointerout', () => {
      restartButton.setScale(1);
    });

    // 点击重新开始
    restartButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // 返回菜单提示
    const menuText = this.add.text(width / 2, height * 0.85, 'Press SPACE for Menu', {
      fontSize: '20px',
      color: '#95a5a6'
    });
    menuText.setOrigin(0.5);

    // 空格键返回菜单
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MenuScene');
    });

    // 标题动画
    this.tweens.add({
      targets: gameOverText,
      scale: 1.1,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }
}