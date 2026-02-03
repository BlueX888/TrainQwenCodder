class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 验证信号：记录排序次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景文字提示
    this.add.text(400, 50, '拖动青色方块，松手后自动排序', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 100, `排序次数: ${this.sortCount}`, {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建青色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRect(0, 0, 100, 100);
    graphics.generateTexture('cyanBox', 100, 100);
    graphics.destroy();

    // 存储所有可拖拽物体
    this.draggableObjects = [];

    // 创建3个青色方块，初始位置不同
    const initialPositions = [
      { x: 200, y: 200 },
      { x: 400, y: 350 },
      { x: 600, y: 500 }
    ];

    initialPositions.forEach((pos, index) => {
      const box = this.add.sprite(pos.x, pos.y, 'cyanBox');
      
      // 添加编号文字
      const text = this.add.text(pos.x, pos.y, `${index + 1}`, {
        fontSize: '32px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 将文字作为子对象绑定到方块
      box.text = text;
      box.index = index;

      // 启用交互和拖拽
      box.setInteractive({ draggable: true });
      
      // 添加到数组
      this.draggableObjects.push(box);
    });

    // 监听拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文字位置
      if (gameObject.text) {
        gameObject.text.x = dragX;
        gameObject.text.y = dragY;
      }
    });

    // 监听拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽时放大并提升层级
      gameObject.setScale(1.1);
      gameObject.setDepth(100);
      if (gameObject.text) {
        gameObject.text.setDepth(101);
      }
    });

    // 监听拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复大小和层级
      gameObject.setScale(1);
      gameObject.setDepth(0);
      if (gameObject.text) {
        gameObject.text.setDepth(1);
      }

      // 执行排序
      this.sortObjects();
    });
  }

  sortObjects() {
    // 按当前Y坐标排序（从上到下）
    const sorted = [...this.draggableObjects].sort((a, b) => a.y - b.y);

    // 定义目标Y坐标位置
    const targetYPositions = [200, 350, 500];
    const targetX = 400; // 统一的X坐标

    // 为每个物体分配新位置并创建动画
    sorted.forEach((obj, index) => {
      const targetY = targetYPositions[index];

      // 使用 Tween 平滑移动到目标位置
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步文字位置
          if (obj.text) {
            obj.text.x = obj.x;
            obj.text.y = obj.y;
          }
        }
      });

      // 文字也添加动画（虽然已在 onUpdate 中同步，这里保证独立性）
      if (obj.text) {
        this.tweens.add({
          targets: obj.text,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 增加排序次数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 控制台输出验证信息
    console.log(`排序完成 #${this.sortCount}，当前顺序:`, 
      sorted.map(obj => `物体${obj.index + 1}`).join(' -> '));
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);