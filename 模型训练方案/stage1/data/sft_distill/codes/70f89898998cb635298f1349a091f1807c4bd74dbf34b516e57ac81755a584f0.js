class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.targetScore = 15;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);

    // 创建玩家（蓝色方块）
    this.player = this.physics.add.sprite(100, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(200);
    this.player.setDrag(500);

    // 创建AI敌人（绿色方块）
    this.enemy = this.physics.add.sprite(700, 300, 'enemyTex');
    this.enemy.setCollideWorldBounds(true);

    // 创建可收集物品组
    this.collectibles = this.physics.add.group();
    this.createCollectibles();

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.hitEnemy,
      null,
      this
    );

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.scoreText = this.add.text(16, 16, `Score: 0/${this.targetScore}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 提示文本
    this.hintText = this.add.text(400, 550, 'Use Arrow Keys to Move. Collect 15 items to win!', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.hintText.setOrigin(0.5);
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemyTex', 32, 32);
    enemyGraphics.destroy();

    // 创建收集物纹理（黄色圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillCircle(12, 12, 12);
    itemGraphics.generateTexture('itemTex', 24, 24);
    itemGraphics.destroy();
  }

  createCollectibles() {
    // 使用固定种子生成随机位置
    const seed = 12345;
    const random = this.createSeededRandom(seed);

    for (let i = 0; i < this.targetScore; i++) {
      let x, y;
      let validPosition = false;

      // 确保物品不会生成在玩家或AI附近
      while (!validPosition) {
        x = random() * 700 + 50; // 50-750
        y = random() * 500 + 50; // 50-550

        const distToPlayer = Phaser.Math.Distance.Between(x, y, 100, 300);
        const distToEnemy = Phaser.Math.Distance.Between(x, y, 700, 300);

        if (distToPlayer > 100 && distToEnemy > 100) {
          validPosition = true;
        }
      }

      const item = this.collectibles.create(x, y, 'itemTex');
      item.setCircle(12);
    }
  }

  // 创建固定种子的随机数生成器
  createSeededRandom(seed) {
    let currentSeed = seed;
    return function() {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  collectItem(player, item) {
    if (this.gameOver || this.gameWon) return;

    item.destroy();
    this.score++;
    this.scoreText.setText(`Score: ${this.score}/${this.targetScore}`);

    // 检查是否获胜
    if (this.score >= this.targetScore) {
      this.gameWon = true;
      this.winGame();
    }
  }

  hitEnemy(player, enemy) {
    if (this.gameOver || this.gameWon) return;

    this.gameOver = true;
    this.loseGame();
  }

  winGame() {
    this.physics.pause();
    this.player.setTint(0x00ff00);
    
    this.statusText.setText('YOU WIN!');
    this.statusText.setStyle({ fill: '#00ff00' });
    this.statusText.setVisible(true);

    this.hintText.setText('Congratulations! You collected all items!');
    this.hintText.setStyle({ fill: '#00ff00' });
  }

  loseGame() {
    this.physics.pause();
    this.player.setTint(0xff0000);
    
    this.statusText.setText('GAME OVER!');
    this.statusText.setStyle({ fill: '#ff0000' });
    this.statusText.setVisible(true);

    this.hintText.setText('You were caught by the AI!');
    this.hintText.setStyle({ fill: '#ff0000' });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;

    // 玩家移动控制
    const speed = 200;
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // AI追踪玩家（速度160）
    this.physics.moveToObject(this.enemy, this.player, 160);
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