// 完整的 Phaser3 收集物品游戏
class CollectGameScene extends Phaser.Scene {
  constructor() {
    super('CollectGameScene');
    this.score = 0;
    this.scoreText = null;
    this.player = null;
    this.collectibles = null;
    this.cursors = null;
  }

  preload() {
    // 使用 Graphics 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 使用 Graphics 创建可收集物体纹理（蓝色圆形）
    const collectibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    collectibleGraphics.fillStyle(0x0088ff, 1);
    collectibleGraphics.fillCircle(15, 15, 15);
    collectibleGraphics.generateTexture('collectible', 30, 30);
    collectibleGraphics.destroy();
  }

  create() {
    // 添加背景色提示
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.setDamping(true);
    this.player.setDrag(0.9);

    // 创建可收集物体组
    this.collectibles = this.physics.add.group();

    // 随机生成15个蓝色可收集物体
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 400);
      const collectible = this.collectibles.create(x, y, 'collectible');
      collectible.setCircle(15); // 设置圆形碰撞体
      collectible.body.setAllowGravity(false); // 不受重力影响
      
      // 添加轻微的浮动动画效果
      this.tweens.add({
        targets: collectible,
        y: y + 10,
        duration: 1000 + i * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // 创建分数文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.scoreText.setDepth(100);

    // 添加游戏说明
    const instructions = this.add.text(400, 550, 'Use Arrow Keys to Move', {
      fontSize: '20px',
      fill: '#aaaaaa',
      fontFamily: 'Arial'
    });
    instructions.setOrigin(0.5);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.collectItem,
      null,
      this
    );

    // 验证信号：输出初始状态
    console.log('Game Started - Initial Score:', this.score);
    console.log('Total Collectibles:', this.collectibles.getChildren().length);
  }

  update() {
    // 玩家移动控制
    const speed = 300;

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
  }

  collectItem(player, collectible) {
    // 播放收集效果（缩放动画）
    this.tweens.add({
      targets: collectible,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        collectible.destroy();
      }
    });

    // 增加分数
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 验证信号：输出收集状态
    console.log('Item Collected! Current Score:', this.score);
    console.log('Remaining Collectibles:', this.collectibles.getChildren().length - 1);

    // 检查是否收集完所有物体
    if (this.collectibles.getChildren().length === 1) { // 1是因为当前物体还未完全销毁
      setTimeout(() => {
        this.showVictoryMessage();
      }, 300);
    }

    // 创建收集特效（粒子效果）
    const particles = this.add.particles(collectible.x, collectible.y, 'collectible', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      blendMode: 'ADD',
      quantity: 8
    });

    // 500ms后停止粒子发射器
    setTimeout(() => {
      particles.destroy();
    }, 500);
  }

  showVictoryMessage() {
    // 显示胜利消息
    const victoryText = this.add.text(400, 300, 'All Collected!\nFinal Score: ' + this.score, {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center'
    });
    victoryText.setOrigin(0.5);
    victoryText.setDepth(200);

    // 闪烁效果
    this.tweens.add({
      targets: victoryText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    console.log('Victory! All items collected. Final Score:', this.score);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力，自由移动
      debug: false
    }
  },
  scene: CollectGameScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 暴露全局变量用于验证
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    score: scene.score,
    remainingCollectibles: scene.collectibles ? scene.collectibles.getChildren().length : 0,
    playerPosition: scene.player ? { x: scene.player.x, y: scene.player.y } : null
  };
};

console.log('Game initialized. Use window.getGameState() to check game state.');